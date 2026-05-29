'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  description: z.string().max(160, 'Deskripsi maksimal 160 karakter').optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.post('/publications', values);
      router.push('/dashboard/articles');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      form.setError('root', {
        message: apiErr?.response?.data?.message ?? 'Gagal membuat publication.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Mulai
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Buat publication kamu
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Publication adalah blog kamu di Lentera. Kamu bisa mengundang penulis lain setelah ini.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama publication</FormLabel>
                  <FormControl>
                    <Input placeholder="Mis. Lentera, Pikiran Pagi, Catatan Rangga" {...field} />
                  </FormControl>
                  <FormDescription>
                    Muncul di header, email, dan judul tab browser.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi singkat <span className="font-normal text-muted-foreground">(opsional)</span></FormLabel>
                  <FormControl>
                    <textarea
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      placeholder="Tulisan tentang apa saja yang perlu kamu tulis…"
                      maxLength={160}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Maks 160 karakter. Muncul di hasil pencarian.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Membuat publication…' : 'Buat publication'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
