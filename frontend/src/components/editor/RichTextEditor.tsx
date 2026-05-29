'use client';

import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

interface RichTextEditorProps {
  content?: object | null;
  onChange?: (json: object) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Tekan / untuk perintah, atau mulai menulis…',
  editable = true,
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: content ?? '',
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON());
    },
  });

  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  async function handleImageFile(file: File) {
    if (!editor || !onImageUpload) return;
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      console.error('[RichTextEditor] Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  function handleYoutubeEmbed() {
    if (!editor) return;
    const url = prompt('Masukkan URL YouTube:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  return (
    <div className="relative">
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageFile(file);
          e.target.value = '';
        }}
      />

      {editable && editor && (
        <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted p-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Tebal (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Miring (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Garis bawah (Ctrl+U)"
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Coret"
          >
            <span className="line-through">S</span>
          </ToolbarButton>
          <Divider />
          {([1, 2, 3, 4] as const).map((level) => (
            <ToolbarButton
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              active={editor.isActive('heading', { level })}
              title={`Heading ${level}`}
            >
              H{level}
            </ToolbarButton>
          ))}
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Daftar poin"
          >
            •—
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Daftar bernomor"
          >
            1—
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Kutipan"
          >
            &ldquo;
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Blok kode"
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
            title="Garis pemisah"
          >
            —
          </ToolbarButton>
          {onImageUpload && (
            <>
              <Divider />
              <ToolbarButton
                onClick={() => imageInputRef.current?.click()}
                active={false}
                title={uploading ? 'Mengunggah gambar…' : 'Unggah gambar'}
                disabled={uploading}
              >
                {uploading ? '⏳' : '🖼'}
              </ToolbarButton>
              <ToolbarButton
                onClick={handleYoutubeEmbed}
                active={editor.isActive('youtube')}
                title="Embed YouTube"
              >
                ▶
              </ToolbarButton>
            </>
          )}
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-neutral max-w-none [&_.tiptap]:min-h-[300px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
      />

      {editable && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {wordCount.toLocaleString('id-ID')} kata · {readingTime} mnt baca
        </p>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-foreground text-background' : 'text-foreground hover:bg-background'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}
