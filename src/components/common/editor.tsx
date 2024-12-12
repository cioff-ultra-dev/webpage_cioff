import React, { useEffect } from "react";
import {
  EditorContent,
  useEditor,
  Editor as EditorTipTap,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export interface EditorProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  onContentChange?: (content: string) => void;
}
const MenuBar = ({ editor }: { editor: EditorTipTap }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white border rounded-lg shadow-sm">
      {/* Text Style */}
      <div className="flex gap-1 border-r pr-2">
        <Button
          size="sm"
          variant={editor?.isActive("bold") ? "default" : "outline"}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor?.isActive("italic") ? "default" : "outline"}
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
          variant={editor?.isActive("bulletList") ? "default" : "outline"}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List (Cmd+Shift+8)"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor?.isActive("orderedList") ? "default" : "outline"}
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
          variant={
            editor?.isActive({ textAlign: "left" }) ? "default" : "outline"
          }
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={
            editor?.isActive({ textAlign: "center" }) ? "default" : "outline"
          }
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={
            editor?.isActive({ textAlign: "right" }) ? "default" : "outline"
          }
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={
            editor?.isActive({ textAlign: "justify" }) ? "default" : "outline"
          }
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* Block Quote */}
      <div className="flex gap-1 border-r pr-2">
        <Button
          size="sm"
          variant={editor?.isActive("blockquote") ? "default" : "outline"}
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
};

const Editor = ({ content, onContentChange, ...props }: EditorProps) => {
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
            class: "border-l-4 border-gray-300 pl-4 my-4",
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-700 underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Write something...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} {...props} />
    </div>
  );
};

export { Editor };
