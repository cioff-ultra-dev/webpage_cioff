'use client'
import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { RawCommands, Command, CommandProps } from '@tiptap/core';

// Extend the ChainedCommands interface to include setFontSize
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
    };
  }
}

type Section = {
  id: string;
  type: 'title' | 'subtitle' | 'paragraph' | 'image' | 'list';
  content: string;
};

type EditableArticleTemplateProps = {
  initialContent: {
    title: string;
    description: string;
    sections: Section[];
  };
  onSave: (content: { title: string; description: string; sections: Section[] }) => void;
  currentUser?: {
    id: string;
    name: string;
    image?: string;
  };
};

const EditableArticleTemplate: React.FC<EditableArticleTemplateProps> = ({ initialContent, onSave, currentUser }) => {
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const [title, setTitle] = useState(initialContent.title);
  const [description, setDescription] = useState(initialContent.description);
  const [sections, setSections] = useState<Section[]>(initialContent.sections);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
    ],
    content: description,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(description);
    }
  }, [editor, description]);

  const handleSaveClick = () => {
    if (editor) {
      const updatedDescription = editor.getHTML();
      onSave({ title, description: updatedDescription, sections });
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  const addSection = (type: Section['type']) => {
    const newSection: Section = { id: Date.now().toString(), type, content: '' };
    setSections([...sections, newSection]);
  };

  const updateSection = useCallback((id: string, content: string) => {
    setSections(sections => sections.map(section =>
      section.id === id ? { ...section, content } : section
    ));
  }, []);

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, sectionId: string, fileType: 'image' | 'video' | 'audio') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith(fileType)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          updateSection(sectionId, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    setDraggedFile(null);
  };

  const handleFileDragStart = (e: React.DragEvent<HTMLElement>, file: File) => {
    setDraggedFile(file);
  };

  const renderTextFormatButtons = () => (
    <div className="flex flex-wrap space-x-2 mb-2">
      <Button size="sm" onClick={() => editor?.chain().focus().setMark('bold').run()}>
        Bold
      </Button>
      <Button size="sm" onClick={() => editor?.chain().focus().setMark('italic').run()}>
        Italic
      </Button>
    
      <Button size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </Button>
      <Button size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Button>
      <Button size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Button>
      {/* <Select onValueChange={(value) => editor?.chain().focus().setFontFamily(value).run()}>
        <SelectTrigger>
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Helvetica">Helvetica</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Courier">Courier</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => editor?.chain().focus().setColor(value).run()}>
        <SelectTrigger>
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="#000000">Black</SelectItem>
          <SelectItem value="#FF0000">Red</SelectItem>
          <SelectItem value="#00FF00">Green</SelectItem>
          <SelectItem value="#0000FF">Blue</SelectItem>
        </SelectContent>
      </Select> */}
      <Select onValueChange={(value) => editor?.chain().focus().setFontSize(value).run()}>
        <SelectTrigger>
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="12px">12px</SelectItem>
          <SelectItem value="14px">14px</SelectItem>
          <SelectItem value="16px">16px</SelectItem>
          <SelectItem value="18px">18px</SelectItem>
          <SelectItem value="20px">20px</SelectItem>
          <SelectItem value="24px">24px</SelectItem>
          <SelectItem value="28px">28px</SelectItem>
          <SelectItem value="32px">32px</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'title':
      case 'subtitle':
      case 'paragraph':
      case 'list':
        return <EditorContent editor={editor} className="border p-2 rounded" />;
      case 'image':
        return (
          <div
            onDrop={(e) => handleFileDrop(e, section.id, 'image')}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
          >
            {section.content ? (
              <NextImage
                src={section.content}
                alt="Article image"
                width={800}
                height={400}
                className="rounded-lg"
              />
            ) : (
              <p>Drag and drop an image here, or click to select</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {currentUser && (
        <div className="flex items-center mb-6">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={currentUser.image} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-500">By {currentUser.name}</span>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="article">
          {(provided) => (
            <article
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-4 p-2 border border-gray-200 rounded"
                    >
                      {renderSection(section)}
                      <Button onClick={() => removeSection(section.id)} variant="destructive" size="sm" className="mt-2">
                        Remove Section
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </article>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-between mt-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button>Add Section</Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="grid gap-4">
              <Button onClick={() => addSection('title')}>Add Title</Button>
              <Button onClick={() => addSection('subtitle')}>Add Subtitle</Button>
              <Button onClick={() => addSection('paragraph')}>Add Paragraph</Button>
              <Button onClick={() => addSection('image')}>Add Image</Button>
              <Button onClick={() => addSection('list')}>Add List</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSaveClick} className="bg-green-500 hover:bg-green-600 text-white">
          Save Article
        </Button>
      </div>

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-2 bg-white p-2 rounded shadow-lg">
            <Button
              size="sm"
              variant={editor.isActive('bold') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('italic') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('heading') ? 'default' : 'outline'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </Button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
};

export default EditableArticleTemplate;
