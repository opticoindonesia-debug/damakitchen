'use client';

import { useEffect, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Node, mergeAttributes } from '@tiptap/core';
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Undo2, Unlink } from 'lucide-react';
import { MediaPicker } from './media';
import { cn } from '@/lib/utils';

/**
 * Image with alt text and an editable caption: <figure><img><figcaption>.
 * (The caption is normal inline text inside the figure.)
 */
const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'inline*',
  draggable: true,
  isolating: true,
  addAttributes() {
    return { src: { default: null }, alt: { default: '' } };
  },
  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img');
          return img ? { src: img.getAttribute('src'), alt: img.getAttribute('alt') ?? '' } : false;
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute('src'), alt: (el as HTMLElement).getAttribute('alt') ?? '' }),
      },
    ];
  },
  renderHTML({ node }) {
    return ['figure', ['img', mergeAttributes({ src: node.attrs.src, alt: node.attrs.alt, loading: 'lazy' })], ['figcaption', 0]];
  },
});

function Tool({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn('rounded p-1.5 text-stone-700 hover:bg-stone-200 disabled:opacity-40', active && 'bg-stone-200 text-stone-900')}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Alamat tautan (mis. /menu, https://…, mailto:…)', prev ?? '');
    if (url === null) return;
    if (!url.trim()) return editor.chain().focus().unsetLink().run();
    if (!/^(\/|#|https?:\/\/|mailto:|tel:)/.test(url.trim())) {
      window.alert('Tautan harus diawali "/", "https://", "mailto:" atau "tel:".');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };
  return (
    <div className="flex flex-wrap gap-0.5 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
      <Tool label="Judul bagian (H2)" active={editor.isActive('heading', { level: 2 })} on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></Tool>
      <Tool label="Sub-judul (H3)" active={editor.isActive('heading', { level: 3 })} on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></Tool>
      <Tool label="Tebal" active={editor.isActive('bold')} on={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></Tool>
      <Tool label="Miring" active={editor.isActive('italic')} on={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></Tool>
      <Tool label="Daftar poin" active={editor.isActive('bulletList')} on={() => editor.chain().focus().toggleBulletList().run()}><List size={17} /></Tool>
      <Tool label="Daftar bernomor" active={editor.isActive('orderedList')} on={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></Tool>
      <Tool label="Kutipan" active={editor.isActive('blockquote')} on={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></Tool>
      <Tool label="Tautan" active={editor.isActive('link')} on={setLink}><Link2 size={17} /></Tool>
      <Tool label="Hapus tautan" disabled={!editor.isActive('link')} on={() => editor.chain().focus().unsetLink().run()}><Unlink size={17} /></Tool>
      <Tool label="Sisipkan foto" on={onImage}><ImagePlus size={17} /></Tool>
      <Tool label="Garis pemisah" on={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={17} /></Tool>
      <span className="mx-1 w-px bg-stone-300" />
      <Tool label="Urungkan" disabled={!editor.can().undo()} on={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></Tool>
      <Tool label="Ulangi" disabled={!editor.can().redo()} on={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></Tool>
    </div>
  );
}

/**
 * Rich text editor (TipTap). Outputs HTML which the server sanitizes against
 * a strict allow-list before saving (lib/sanitize.ts).
 */
export function RichTextEditor({ value, onChange, label, minimal }: { value: string; onChange: (html: string) => void; label?: string; minimal?: boolean }) {
  const [picker, setPicker] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false, link: false, underline: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: null, target: null } }),
      Figure,
    ],
    content: value || '',
    editorProps: { attributes: { class: 'prose-sm px-4 py-3 text-[15px] leading-relaxed text-stone-900', ...(label ? { 'aria-label': label } : {}), role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Keep in sync if the value is replaced from outside (e.g. discard changes).
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value)) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className={cn('overflow-hidden rounded-md border border-stone-300 bg-white focus-within:border-[#1F4D4D] focus-within:ring-2 focus-within:ring-[#1F4D4D]/20', minimal && 'text-sm')}>
      {editor && <Toolbar editor={editor} onImage={() => setPicker(true)} />}
      <EditorContent editor={editor} />
      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(items) => {
          const m = items[0];
          setPicker(false);
          if (!m || !editor) return;
          const alt = m.alt || window.prompt('Deskripsi foto (alt) — apa isi foto ini?', '') || '';
          editor.chain().focus().insertContent({ type: 'figure', attrs: { src: m.url, alt }, content: [] }).run();
        }}
      />
    </div>
  );
}
