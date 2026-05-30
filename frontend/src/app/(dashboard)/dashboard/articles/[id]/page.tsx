'use client';

import { Suspense, useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useAuthStore } from '@/store/authStore';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: object | null;
  excerpt: string | null;
  coverImageUrl: string | null;
  visibility: 'free' | 'members_only';
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  publicationId: string;
}

interface Publication {
  id: string;
  slug: string;
  name: string;
}

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ArticleEditorContent params={params} />
    </Suspense>
  );
}

function ArticleEditorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [article, setArticle] = useState<Article | null>(null);
  const [pub, setPub] = useState<Publication | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<object>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showSettings, setShowSettings] = useState(false);
  const [visibility, setVisibility] = useState<'free' | 'members_only'>('free');
  const [excerpt, setExcerpt] = useState('');
  const [slug, setSlug] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const lastSavedRef = useRef<number>(Date.now());
  const pendingRef = useRef(false);

  // Load article + publication on mount
  useEffect(() => {
    if (!accessToken) return;

    const loadData = async () => {
      try {
        const pubsRes = await apiClient.get<{ data: Publication[] }>('/publications/mine');
        const firstPub = pubsRes.data.data[0];
        if (!firstPub) return;
        setPub(firstPub);

        // Fetch all articles and find by id
        const articlesRes = await apiClient.get<{ data: Article[] }>(
          `/publications/${firstPub.id}/articles?limit=100`,
        );
        const found = articlesRes.data.data.find((a) => a.id === id);
        if (found) {
          setArticle(found);
          setTitle(found.title);
          setContent(found.content ?? {});
          setVisibility(found.visibility);
          setExcerpt(found.excerpt ?? '');
          setSlug(found.slug);
          setScheduledAt(found.scheduledAt ?? '');
          setCoverImageUrl(found.coverImageUrl);
        }
      } catch {
        // ignore
      }
    };
    void loadData();
  }, [id, accessToken]);

  // Autosave every 30 seconds when there are unsaved changes
  useEffect(() => {
    if (!article || !pub) return;

    const interval = setInterval(async () => {
      if (!pendingRef.current) return;
      await save();
    }, 30000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, pub, title, content, visibility, excerpt, slug]);

  async function save() {
    if (!article || !pub) return;
    setSaveStatus('saving');
    try {
      await apiClient.patch(`/publications/${pub.id}/articles/${article.id}`, {
        title,
        content,
        visibility,
        excerpt: excerpt || null,
        slug,
        coverImageUrl,
      });
      setSaveStatus('saved');
      lastSavedRef.current = Date.now();
      pendingRef.current = false;
    } catch {
      setSaveStatus('unsaved');
    }
  }

  function markUnsaved() {
    setSaveStatus('unsaved');
    pendingRef.current = true;
  }

  async function handlePublish() {
    if (!article || !pub) return;
    await save();
    setPublishing(true);
    try {
      await apiClient.post(`/publications/${pub.id}/articles/${article.id}/publish`, {
        scheduledAt: scheduledAt || null,
      });
      router.push('/dashboard/articles');
    } catch {
      setPublishing(false);
    }
  }

  if (!article) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memuat artikel…
      </div>
    );
  }

  const secondsAgo = Math.round((Date.now() - lastSavedRef.current) / 1000);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-background px-6 py-3">
        <Link
          href="/dashboard/articles"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Artikel
        </Link>
        <div className="h-5 w-px bg-border" />
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            className={`h-2 w-2 rounded-full ${saveStatus === 'saved' ? 'bg-foreground/40' : saveStatus === 'saving' ? 'bg-yellow-500' : 'bg-destructive'}`}
          />
          {saveStatus === 'saved'
            ? `Tersimpan otomatis · ${secondsAgo < 5 ? 'baru saja' : `${secondsAgo} detik lalu`}`
            : saveStatus === 'saving'
              ? 'Menyimpan…'
              : 'Perubahan belum tersimpan'}
        </span>
        <div className="flex-1" />
        <Button variant="ghost" type="button" onClick={() => save()} disabled={saveStatus === 'saving'}>
          Simpan
        </Button>
        <Button
          variant={showSettings ? 'outline' : 'ghost'}
          type="button"
          onClick={() => setShowSettings((v) => !v)}
        >
          Pengaturan
        </Button>
        <Button type="button" onClick={handlePublish} disabled={publishing}>
          {publishing ? 'Menerbitkan…' : 'Terbitkan'}
        </Button>
      </header>

      {/* Editor + Settings */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[680px] px-8 py-14">
            {/* Title */}
            <textarea
              className="mb-4 w-full resize-none bg-transparent font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
              placeholder="Judul artikel…"
              rows={2}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markUnsaved();
                // auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />

            {/* Body */}
            <RichTextEditor
              content={content}
              onChange={(json) => {
                setContent(json);
                markUnsaved();
              }}
              onImageUpload={(file) => uploadToCloudinary(file, 'lentera/articles')}
            />
          </div>
        </div>

        {/* Settings drawer */}
        {showSettings && (
          <aside className="w-80 shrink-0 overflow-auto border-l border-border bg-background">
            <div className="p-6">
              <h2 className="mb-1 font-serif text-lg font-medium text-foreground">
                Pengaturan terbit
              </h2>
              <p className="mb-6 text-xs text-muted-foreground">
                Tersimpan otomatis bersama draft
              </p>

              {/* Cover Image */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gambar sampul
                </p>
                {coverImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-32 w-full">
                      <Image
                        src={coverImageUrl}
                        alt="Cover"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-center text-xs font-medium text-foreground hover:bg-muted">
                        {coverUploading ? 'Mengunggah…' : 'Ganti'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={coverUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setCoverUploading(true);
                            try {
                              const url = await uploadToCloudinary(file, 'lentera/covers');
                              setCoverImageUrl(url);
                              markUnsaved();
                            } finally {
                              setCoverUploading(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                        onClick={() => { setCoverImageUrl(null); markUnsaved(); }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground ${coverUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {coverUploading ? (
                      <span>Mengunggah…</span>
                    ) : (
                      <>
                        <span className="text-lg">+</span>
                        <span className="text-xs">Unggah gambar sampul</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={coverUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCoverUploading(true);
                        try {
                          const url = await uploadToCloudinary(file, 'lentera/covers');
                          setCoverImageUrl(url);
                          markUnsaved();
                        } finally {
                          setCoverUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Visibility */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Visibility
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ['free', 'Gratis', 'Bisa dibaca semua pengunjung'],
                      ['members_only', 'Khusus member', 'Preview 200 kata, lalu paywall'],
                    ] as const
                  ).map(([v, label, desc]) => (
                    <label
                      key={v}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                        visibility === v ? 'border-foreground' : 'border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        className="mt-0.5 accent-foreground"
                        checked={visibility === v}
                        onChange={() => { setVisibility(v); markUnsaved(); }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Excerpt
                </label>
                <textarea
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-lg border px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2"
                  rows={3}
                  maxLength={500}
                  placeholder="Deskripsi singkat artikel…"
                  value={excerpt}
                  onChange={(e) => { setExcerpt(e.target.value); markUnsaved(); }}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {excerpt.length} / 500
                </p>
              </div>

              {/* Schedule */}
              <div className="mb-6">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Jadwalkan (opsional)
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => { setScheduledAt(e.target.value); markUnsaved(); }}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Slug URL
                </label>
                <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {pub?.slug}.lentera.id/
                </div>
                <Input
                  className="mt-1"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); markUnsaved(); }}
                  placeholder="slug-artikel"
                />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
