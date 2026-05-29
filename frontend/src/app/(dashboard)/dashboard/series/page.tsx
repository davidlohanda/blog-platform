'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { usePublication } from '@/hooks/usePublication';

interface Series {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  _count: { articles: number };
}

const createSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter').max(500),
  description: z.string().max(1000).optional(),
});

type CreateValues = z.infer<typeof createSchema>;

export default function SeriesPage() {
  const { pub, loading: pubLoading } = usePublication(); // redirects to /onboarding if no publication
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<CreateValues>({ resolver: zodResolver(createSchema) });

  useEffect(() => {
    if (!pub) return;
    let cancelled = false;
    apiClient
      .get<{ data: Series[] }>(`/publications/${pub.id}/series`)
      .then(({ data }) => { if (!cancelled) setSeriesList(data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pub]);

  async function onCreate(values: CreateValues) {
    if (!pub) return;
    try {
      const { data } = await apiClient.post<{ data: Series }>(
        `/publications/${pub.id}/series`,
        values,
      );
      setSeriesList((prev) => [data.data, ...prev]);
      form.reset();
      setShowForm(false);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      form.setError('root', { message: apiErr?.response?.data?.message ?? 'Gagal membuat series.' });
    }
  }

  if (pubLoading) {
    return (
      <DashboardShell title="Series">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Series"
      subtitle="Kelompokkan artikel dalam sebuah series berurutan."
      publicationName={pub?.name}
      publicationDomain={pub ? `${pub.slug}.lentera.id` : undefined}
      action={
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Batal' : '+ Buat series'}
        </Button>
      }
    >
      <div className="p-8">
        {/* Create form */}
        {showForm && (
          <Card className="mb-6 p-6">
            <h2 className="mb-4 font-serif text-lg font-medium text-foreground">Buat series baru</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul series</FormLabel>
                      <FormControl>
                        <Input placeholder="Mis. Esai Mingguan, Catatan Kerja…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span></FormLabel>
                      <FormControl>
                        <textarea
                          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                          placeholder="Tentang apa series ini…"
                          maxLength={1000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Membuat…' : 'Buat series'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {/* Series list */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : seriesList.length === 0 ? (
          <div className="rounded-xl border border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">Belum ada series.</p>
            <button
              className="mt-2 text-sm text-foreground underline"
              onClick={() => setShowForm(true)}
            >
              Buat series pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.map((s) => (
              <Card key={s.id} className="p-5">
                <h3 className="mb-1 font-serif text-base font-semibold text-foreground">{s.title}</h3>
                {s.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {s._count.articles} artikel · oleh {s.author.name.split(' ')[0]}
                  </span>
                  <a
                    href={`/dashboard/series/${s.id}`}
                    className="text-xs text-foreground hover:underline"
                  >
                    Kelola →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
