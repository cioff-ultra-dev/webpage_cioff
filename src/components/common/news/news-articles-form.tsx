'use client'
import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Quote } from 'lucide-react';


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
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 my-4',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      CharacterCount.configure({
        limit: 10000,
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
    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white border rounded-lg shadow-sm">
      {/* Text Style */}
      <div className="flex gap-1 border-r pr-2">
        <Button 
          size="sm" 
          variant={editor?.isActive('bold') ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          size="sm"
          variant={editor?.isActive('italic') ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r pr-2">
        <Button 
          size="sm"
          variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List (Cmd+Shift+8)"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          size="sm"
          variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered List (Cmd+Shift+7)"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r pr-2">
        <Button 
          size="sm"
          variant={editor?.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button 
          size="sm"
          variant={editor?.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button 
          size="sm"
          variant={editor?.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button 
          size="sm"
          variant={editor?.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* Block Quote */}
      <div className="flex gap-1 border-r pr-2">
        <Button 
          size="sm"
          variant={editor?.isActive('blockquote') ? 'default' : 'outline'}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Block Quote (Cmd+Shift+B)"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Character Count */}
      <div className="flex items-center text-sm text-gray-500">
        {editor?.storage.characterCount.characters()} characters
      </div>
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
