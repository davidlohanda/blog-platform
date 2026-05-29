import type { ReactNode } from 'react';

// Renders Tiptap ProseMirror JSON to React elements server-side
interface TiptapNode {
  type: string;
  text?: string;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, string> }>;
  attrs?: Record<string, unknown>;
}

function renderMarks(text: string, marks: TiptapNode['marks']): ReactNode {
  if (!marks || marks.length === 0) return text;
  return marks.reduce<ReactNode>((acc, mark) => {
    if (mark.type === 'bold') return <strong>{acc}</strong>;
    if (mark.type === 'italic') return <em>{acc}</em>;
    if (mark.type === 'underline') return <u>{acc}</u>;
    if (mark.type === 'strike') return <s>{acc}</s>;
    if (mark.type === 'code') return <code>{acc}</code>;
    if (mark.type === 'link') {
      return (
        <a href={mark.attrs?.href as string} target="_blank" rel="noopener noreferrer">
          {acc}
        </a>
      );
    }
    return acc;
  }, text as ReactNode);
}

function renderInlineContent(nodes: TiptapNode[] | undefined): ReactNode[] {
  if (!nodes) return [];
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      return <span key={i}>{renderMarks(node.text ?? '', node.marks)}</span>;
    }
    if (node.type === 'hardBreak') return <br key={i} />;
    return null;
  });
}

const HEADING_TAGS: Record<number, keyof React.JSX.IntrinsicElements> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

function renderNode(node: TiptapNode, index: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p key={index}>{renderInlineContent(node.content)}</p>;
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      const Tag = HEADING_TAGS[level] ?? 'h2';
      return <Tag key={index}>{renderInlineContent(node.content)}</Tag>;
    }
    case 'bulletList':
      return (
        <ul key={index}>
          {node.content?.map((item, i) => renderNode(item, i))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={index}>
          {node.content?.map((item, i) => renderNode(item, i))}
        </ol>
      );
    case 'listItem':
      return <>{node.content?.map((n, i) => renderNode(n, i))}</>;
    case 'blockquote':
      return (
        <blockquote key={index}>{node.content?.map((n, i) => renderNode(n, i))}</blockquote>
      );
    case 'codeBlock':
      return (
        <pre key={index}>
          <code>{node.content?.map((n) => n.text ?? '').join('')}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={index} />;
    case 'image': {
      const src = node.attrs?.src as string | undefined;
      const alt = node.attrs?.alt as string | undefined;
      const title = node.attrs?.title as string | undefined;
      if (!src) return null;
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt ?? ''} className="mx-auto max-w-full rounded-lg" />
          {title && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {title}
            </figcaption>
          )}
        </figure>
      );
    }
    default:
      if (node.content) {
        return <>{node.content.map((n, i) => renderNode(n, i))}</>;
      }
      return null;
  }
}

export function TiptapRenderer({
  content,
}: {
  content: Record<string, unknown> | null | undefined;
}) {
  if (!content) return null;
  const doc = content as { type: string; content?: TiptapNode[] };
  if (doc.type !== 'doc' || !doc.content) return null;
  return <>{doc.content.map((node, i) => renderNode(node, i))}</>;
}
