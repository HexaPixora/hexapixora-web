"use client";

import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Heading1, Heading2, Heading3, Link2, Image as ImageIcon, Undo, Redo, Minus
} from "lucide-react";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ value, onChange, placeholder = "Start writing..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[400px] focus:outline-none p-4",
      },
    },
  });

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const toolbarBtn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-accent transition-colors ${active ? "bg-accent text-primary" : "text-muted-foreground"}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/30">
        {toolbarBtn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={16} />, "Heading 1")}
        {toolbarBtn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={16} />, "Heading 2")}
        {toolbarBtn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={16} />, "Heading 3")}
        <div className="w-px h-6 bg-border mx-1 self-center" />
        {toolbarBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={16} />, "Bold")}
        {toolbarBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={16} />, "Italic")}
        {toolbarBtn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough size={16} />, "Strikethrough")}
        {toolbarBtn(editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), <Code size={16} />, "Inline Code")}
        <div className="w-px h-6 bg-border mx-1 self-center" />
        {toolbarBtn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List size={16} />, "Bullet List")}
        {toolbarBtn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={16} />, "Numbered List")}
        {toolbarBtn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote size={16} />, "Blockquote")}
        <div className="w-px h-6 bg-border mx-1 self-center" />
        {toolbarBtn(editor.isActive("link"), setLink, <Link2 size={16} />, "Add Link")}
        {toolbarBtn(false, addImage, <ImageIcon size={16} />, "Add Image")}
        {toolbarBtn(false, () => editor.chain().focus().setHorizontalRule().run(), <Minus size={16} />, "Divider")}
        <div className="w-px h-6 bg-border mx-1 self-center" />
        {toolbarBtn(false, () => editor.chain().focus().undo().run(), <Undo size={16} />, "Undo")}
        {toolbarBtn(false, () => editor.chain().focus().redo().run(), <Redo size={16} />, "Redo")}
      </div>
      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
