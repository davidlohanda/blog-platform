'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';
import { uploadToCloudinary } from '@/lib/cloudinary';
import type { AuthUser } from '@/store/authStore';

interface EmailPreference {
  publicationId: string;
  publicationName: string;
  publicationSlug: string;
  logoUrl: string | null;
  newArticle: boolean;
}

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  bio: z.string().max(160, 'Bio maksimal 160 karakter').optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Harus mengandung huruf dan angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [bioLength, setBioLength] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [emailPrefs, setEmailPrefs] = useState<EmailPreference[]>([]);
  const [prefUpdating, setPrefUpdating] = useState<string | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', bio: '' },
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  // Populate profile form when user data is available
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, bio: '' });
    }
  }, [user, profileForm]);

  // Fetch email preferences
  useEffect(() => {
    if (!user) return;
    apiClient
      .get<{ data: EmailPreference[] }>('/users/me/email-preferences')
      .then(({ data }) => setEmailPrefs(data.data))
      .catch(() => {});
  }, [user]);

  async function onProfileSubmit(values: ProfileValues) {
    try {
      setProfileSuccess(false);
      const { data } = await apiClient.patch<{ data: AuthUser }>('/users/me', {
        name: values.name,
        bio: values.bio ?? null,
      });
      if (accessToken) setAuth(accessToken, data.data);
      setProfileSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      profileForm.setError('root', {
        message: apiErr?.response?.data?.message ?? 'Gagal menyimpan profil.',
      });
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    try {
      setPasswordSuccess(false);
      await apiClient.patch('/users/me/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      setPasswordSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'WRONG_PASSWORD') {
        passwordForm.setError('currentPassword', { message: 'Password saat ini salah.' });
      } else if (code === 'NO_PASSWORD') {
        passwordForm.setError('root', { message: apiErr?.response?.data?.message });
      } else {
        passwordForm.setError('root', {
          message: apiErr?.response?.data?.message ?? 'Gagal mengubah password.',
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Akun
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Pengaturan profil
          </h1>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 p-6">
          <div className="mb-6">
            <h2 className="mb-1 text-base font-semibold text-foreground">Foto profil</h2>
            <p className="text-sm text-muted-foreground">JPG, PNG, atau GIF. Maksimum 2 MB.</p>
            <div className="mt-3 flex items-center gap-4">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
                  {user?.name?.slice(0, 2).toUpperCase() ?? '??'}
                </div>
              )}
              <label className={`cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted ${avatarUploading ? 'cursor-not-allowed opacity-50' : ''}`}>
                {avatarUploading ? 'Mengunggah…' : 'Ganti foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={avatarUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !accessToken) return;
                    setAvatarUploading(true);
                    try {
                      const url = await uploadToCloudinary(file, 'lentera/avatars');
                      const { data } = await apiClient.patch<{ data: AuthUser }>('/users/me', { avatarUrl: url });
                      setAuth(accessToken, data.data);
                    } catch {
                      // ignore, user stays with old avatar
                    } finally {
                      setAvatarUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Mis. Rina Astari" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nama yang ditampilkan di komentar dan profil.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </FormLabel>
                <div className="flex items-center gap-3">
                  <Input value={user?.email ?? ''} disabled className="max-w-sm" />
                  {user?.emailVerifiedAt && (
                    <span className="text-xs font-medium text-foreground/70">✓ Terverifikasi</span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Notifikasi dikirim ke alamat ini.
                </p>
              </div>

              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio singkat</FormLabel>
                    <FormControl>
                      <textarea
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ceritakan sedikit tentang dirimu…"
                        maxLength={160}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setBioLength(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormDescription>
                        Maks 160 karakter. Muncul di profil dan kolom komentar.
                      </FormDescription>
                      <span className="text-xs text-muted-foreground">{bioLength} / 160</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {profileForm.formState.errors.root && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {profileForm.formState.errors.root.message}
                </p>
              )}

              {profileSuccess && (
                <p className="rounded-lg bg-foreground/5 px-3 py-2.5 text-sm text-foreground">
                  Profil berhasil disimpan.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => profileForm.reset({ name: user?.name ?? '', bio: '' })}
                >
                  Batalkan
                </Button>
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? 'Menyimpan…' : 'Simpan profil'}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        {/* Password Card */}
        <Card className="mb-6 p-6">
          <h2 className="mb-1 font-serif text-xl font-medium text-foreground">Kata sandi</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Ganti kata sandi kamu. Kamu akan tetap masuk di perangkat ini setelah berhasil.
          </p>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Kata sandi saat ini</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata sandi baru</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimal 8 karakter" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ulangi kata sandi baru</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {passwordForm.formState.errors.root && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {passwordForm.formState.errors.root.message}
                </p>
              )}

              {passwordSuccess && (
                <p className="rounded-lg bg-foreground/5 px-3 py-2.5 text-sm text-foreground">
                  Password berhasil diubah.
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" variant="outline" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? 'Menyimpan…' : 'Simpan kata sandi'}
                </Button>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Saya lupa kata sandi saat ini
                </Link>
              </div>
            </form>
          </Form>
        </Card>

        {/* Email Preferences Card */}
        {emailPrefs.length > 0 && (
          <Card className="mb-6 p-6">
            <h2 className="mb-1 font-serif text-xl font-medium text-foreground">
              Notifikasi email
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Pilih publikasi mana yang boleh mengirimkan notifikasi artikel baru ke emailmu.
            </p>
            <div className="divide-y divide-border">
              {emailPrefs.map((pref) => (
                <div key={pref.publicationId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{pref.publicationName}</p>
                    <p className="text-xs text-muted-foreground">Artikel baru</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={pref.newArticle}
                    disabled={prefUpdating === pref.publicationId}
                    onClick={async () => {
                      setPrefUpdating(pref.publicationId);
                      try {
                        await apiClient.patch(
                          `/users/me/email-preferences/${pref.publicationId}`,
                          { newArticle: !pref.newArticle },
                        );
                        setEmailPrefs((prev) =>
                          prev.map((p) =>
                            p.publicationId === pref.publicationId
                              ? { ...p, newArticle: !p.newArticle }
                              : p,
                          ),
                        );
                      } catch {
                        // ignore
                      } finally {
                        setPrefUpdating(null);
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${pref.newArticle ? 'bg-primary' : 'bg-input'}`}
                  >
                    <span
                      className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-lg ring-0 transition-transform ${pref.newArticle ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-destructive/30 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-1 text-sm font-semibold text-destructive">Hapus akun</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tindakan permanen. Library, komentar, dan profil kamu akan dihapus seluruhnya.
              </p>
            </div>
            <Button variant="outline" type="button" className="shrink-0 text-destructive" disabled>
              Hapus akun…
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
