'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiClient } from '@/lib/api/client';
import { usePublication } from '@/hooks/usePublication';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Publication {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  customDomain: string | null;
}

interface Author {
  publicationId: string;
  userId: string;
  role: 'owner' | 'author';
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}

type ActiveTab = 'general' | 'plans' | 'authors';

interface Plan {
  durationMonths: number;
  price: number;
  isActive: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  { durationMonths: 1, price: 39000, isActive: true },
  { durationMonths: 3, price: 35000, isActive: true },
  { durationMonths: 6, price: 32000, isActive: true },
  { durationMonths: 12, price: 28000, isActive: false },
];

// ─── Schemas ─────────────────────────────────────────────────────────────────

const generalSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  description: z.string().max(160, 'Maks 160 karakter').optional(),
});

const domainSchema = z.object({
  domain: z
    .string()
    .min(4, 'Domain tidak valid')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Format domain tidak valid'),
});

const inviteSchema = z.object({
  email: z.email('Format email tidak valid'),
  role: z.enum(['owner', 'author']),
});

type GeneralValues = z.infer<typeof generalSchema>;
type DomainValues = z.infer<typeof domainSchema>;
type InviteValues = z.infer<typeof inviteSchema>;

// ─── General Tab ─────────────────────────────────────────────────────────────

function GeneralTab({ pub, onSaved }: { pub: Publication; onSaved: (p: Publication) => void }) {
  const [success, setSuccess] = useState(false);
  const [descLen, setDescLen] = useState(pub.description?.length ?? 0);

  const form = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: { name: pub.name, description: pub.description ?? '' },
  });

  async function onSubmit(values: GeneralValues) {
    try {
      setSuccess(false);
      const { data } = await apiClient.patch<{ data: Publication }>(`/publications/${pub.id}`, {
        name: values.name,
        description: values.description ?? null,
      });
      onSaved(data.data);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      form.setError('root', { message: apiErr?.response?.data?.message ?? 'Gagal menyimpan.' });
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama publication</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Muncul di header, email, dan judul tab browser.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi singkat</FormLabel>
                  <FormControl>
                    <textarea
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      maxLength={160}
                      {...field}
                      onChange={(e) => { field.onChange(e); setDescLen(e.target.value.length); }}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormDescription>Maks 160 karakter. Muncul di hasil pencarian.</FormDescription>
                    <span className="text-xs text-muted-foreground">{descLen} / 160</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5">
              <FormLabel className="text-sm font-medium">Logo</FormLabel>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-foreground font-serif text-2xl font-semibold italic text-background">
                  {pub.name.slice(0, 1)}
                </div>
                <Button variant="outline" type="button" disabled>
                  Unggah logo baru
                </Button>
                <span className="text-xs text-muted-foreground">Upload tersedia setelah EPIC 4</span>
              </div>
            </div>

            {form.formState.errors.root && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            {success && (
              <p className="rounded-lg bg-foreground/5 px-3 py-2.5 text-sm text-foreground">
                Pengaturan berhasil disimpan.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => form.reset()}>Batal</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Menyimpan…' : 'Simpan pengaturan'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <CustomDomainCard pub={pub} onSaved={onSaved} />
    </div>
  );
}

function CustomDomainCard({ pub, onSaved }: { pub: Publication; onSaved: (p: Publication) => void }) {
  const form = useForm<DomainValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: { domain: pub.customDomain ?? '' },
  });
  const [success, setSuccess] = useState(false);

  async function onSubmit(values: DomainValues) {
    try {
      setSuccess(false);
      const { data } = await apiClient.post<{ data: Publication }>(
        `/publications/${pub.id}/custom-domain`,
        { domain: values.domain },
      );
      onSaved(data.data);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      form.setError('root', { message: apiErr?.response?.data?.message ?? 'Gagal menyimpan domain.' });
    }
  }

  return (
    <Card className="p-6">
      <h2 className="mb-1 text-sm font-semibold text-foreground">Custom domain</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Gunakan domain kamu sendiri. Setelah disimpan, tambahkan CNAME record ke{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">{pub.slug}.lentera.id</code>.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="contoh.com" className="max-w-xs" {...field} />
                  </FormControl>
                  <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan…' : 'Simpan'}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {pub.customDomain && (
            <div className="inline-flex items-center gap-2 rounded-md bg-foreground/5 px-3 py-1.5 text-xs text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
              Domain tersimpan — status: pending verifikasi
            </div>
          )}
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
          {success && <p className="text-sm text-foreground/70">Domain berhasil disimpan.</p>}
        </form>
      </Form>

      <div className="mt-4 text-xs text-muted-foreground">
        URL fallback:{' '}
        <code className="rounded bg-muted px-1">{pub.slug}.lentera.id</code>
      </div>
    </Card>
  );
}

// ─── Authors Tab ──────────────────────────────────────────────────────────────

function AuthorsTab({ pubId }: { pubId: string }) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const inviteForm = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'author' },
  });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: Author[] }>(`/publications/${pubId}/authors`)
      .then(({ data }) => { if (!cancelled) setAuthors(data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pubId]);

  async function onInvite(values: InviteValues) {
    try {
      await apiClient.post(`/publications/${pubId}/authors/invite`, values);
      inviteForm.reset({ email: '', role: 'author' });
      setInviteSuccess(`Undangan dikirim ke ${values.email}`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      inviteForm.setError('root', {
        message: apiErr?.response?.data?.message ?? 'Gagal mengirim undangan.',
      });
    }
  }

  async function handleRemove(userId: string) {
    try {
      await apiClient.delete(`/publications/${pubId}/authors/${userId}`);
      setAuthors((prev) => prev.filter((a) => a.userId !== userId));
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Invite card */}
      <Card className="p-6">
        <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Undang author baru</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Author yang diundang akan menerima email berisi tautan bergabung.
        </p>
        <Form {...inviteForm}>
          <form onSubmit={inviteForm.handleSubmit(onInvite)} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="email@contoh.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <select
                        className="border-input bg-background h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        {...field}
                      >
                        <option value="author">Author</option>
                        <option value="owner">Owner</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={inviteForm.formState.isSubmitting}>
                Kirim undangan
              </Button>
            </div>
            {inviteForm.formState.errors.root && (
              <p className="text-sm text-destructive">{inviteForm.formState.errors.root.message}</p>
            )}
            {inviteSuccess && (
              <p className="text-sm text-foreground/70">{inviteSuccess}</p>
            )}
          </form>
        </Form>
      </Card>

      {/* Team list */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg font-medium text-foreground">
            Tim author · {authors.length}
          </h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">Memuat…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {authors.map((a) => (
                <tr key={a.userId} className="border-b border-border last:border-0">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {a.user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{a.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.user.email}</td>
                  <td className="px-4 py-3 text-right">
                    {a.role !== 'owner' && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(a.userId)}
                      >
                        Hapus
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── Plans Tab ────────────────────────────────────────────────────────────────

function PlansTab({ pubId }: { pubId: string }) {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: Array<Plan & { savingsPercent: number }> }>(
        `/publications/${pubId}/subscription-plans`,
      )
      .then(({ data }) => {
        // API returns only active plans; merge with defaults to keep all tiers editable
        if (cancelled) return;
        if (data.data.length > 0) {
          const byDuration = new Map(data.data.map((p) => [p.durationMonths, p]));
          setPlans(
            DEFAULT_PLANS.map((d) => {
              const found = byDuration.get(d.durationMonths);
              return found
                ? { durationMonths: d.durationMonths, price: found.price, isActive: true }
                : { ...d, isActive: false };
            }),
          );
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pubId]);

  const basePrice = plans.find((p) => p.durationMonths === 1)?.price ?? 0;

  function savingsFor(p: Plan): number {
    if (p.durationMonths === 1 || !basePrice) return 0;
    return Math.max(0, Math.round((1 - p.price / basePrice) * 100));
  }

  function updatePlan(idx: number, patch: Partial<Plan>) {
    setPlans((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
    setSuccess(false);
  }

  async function save() {
    setSaving(true);
    setSuccess(false);
    try {
      // Only send active plans (must have at least 1)
      const activePlans = plans.filter((p) => p.isActive);
      const payload = activePlans.length > 0 ? activePlans : plans;
      await apiClient.put(`/publications/${pubId}/subscription-plans`, { plans: payload });
      setSuccess(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Memuat paket…</p>;
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-6">
        <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Tier subscription</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Atur harga per bulan dan ketersediaan tiap paket. Perubahan tidak mempengaruhi
          subscriber yang sudah ada.
        </p>

        <div className="space-y-3">
          {plans.map((p, idx) => (
            <div
              key={p.durationMonths}
              className={`flex items-center gap-4 rounded-lg border p-4 ${
                p.isActive ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted font-serif text-base font-semibold">
                {p.durationMonths}
              </div>
              <div className="w-24">
                <p className="text-sm font-semibold text-foreground">{p.durationMonths} Bulan</p>
                {savingsFor(p) > 0 && (
                  <p className="text-xs text-foreground/60">Hemat {savingsFor(p)}%</p>
                )}
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Harga / bulan
                </label>
                <div className="flex items-center">
                  <span className="flex h-9 items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-xs text-muted-foreground">
                    Rp
                  </span>
                  <input
                    type="number"
                    className="h-9 w-full rounded-r-lg border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    value={p.price}
                    disabled={!p.isActive}
                    onChange={(e) => updatePlan(idx, { price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer flex-col items-center gap-1">
                <span className="text-[11px] font-medium text-muted-foreground">Aktif</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-foreground"
                  checked={p.isActive}
                  onChange={(e) => updatePlan(idx, { isActive: e.target.checked })}
                />
              </label>
            </div>
          ))}
        </div>

        {success && (
          <p className="mt-4 rounded-lg bg-foreground/5 px-3 py-2.5 text-sm text-foreground">
            Paket berhasil disimpan.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan paket'}
          </Button>
        </div>
      </Card>

      <div className="rounded-lg bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Platform fee 15% otomatis dipotong dari setiap transaksi. PPN 11% sudah termasuk dalam
        harga yang kamu tetapkan.
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const { pub: basePub, loading } = usePublication(); // redirects to /onboarding if no publication
  const [pubOverride, setPubOverride] = useState<Publication | null>(null);
  const pub = pubOverride ?? basePub; // local updates (after save) override the hook value

  const TABS: Array<{ id: ActiveTab; label: string }> = [
    { id: 'general', label: 'Umum' },
    { id: 'plans', label: 'Paket harga' },
    { id: 'authors', label: 'Author' },
  ];

  if (loading) {
    return (
      <DashboardShell title="Pengaturan" subtitle="Atur publication dan tim author.">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Memuat…
        </div>
      </DashboardShell>
    );
  }

  if (!pub) {
    return (
      <DashboardShell title="Pengaturan">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <p>Kamu belum punya publication.</p>
          <a href="/onboarding" className="text-foreground underline">
            Buat publication sekarang
          </a>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Pengaturan"
      subtitle="Atur publication, dan tim author."
      publicationName={pub.name}
      publicationDomain={`${pub.slug}.lentera.id`}
    >
      {/* Tabs */}
      <div className="border-b border-border px-8">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'general' && (
          <GeneralTab pub={pub} onSaved={setPubOverride} />
        )}
        {activeTab === 'plans' && <PlansTab pubId={pub.id} />}
        {activeTab === 'authors' && (
          <AuthorsTab pubId={pub.id} />
        )}
      </div>
    </DashboardShell>
  );
}
