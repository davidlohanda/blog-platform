import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Lentera — Platform Blog Subscription',
  description:
    'Platform blog subscription untuk penulis Indonesia. Buat publication, kumpulkan subscriber, dan hasilkan dari tulisan kamu.',
};

function PlatformLanding({ role = '' }: { role?: string }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <span className="font-serif text-base font-semibold italic text-background">L</span>
          </div>
          <span className="font-serif text-lg font-semibold text-foreground">Lentera</span>
        </div>
        {role === 'platform_admin' ? (
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Dashboard Admin
          </Link>
        ) : role ? (
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Masuk
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Platform Blog Subscription
          </p>
          <h1 className="mb-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Tulis, kumpulkan subscriber,{' '}
            <span className="italic">dan hasilkan</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Lentera adalah platform blog subscription untuk penulis Indonesia yang ingin membangun
            audiens setia dan penghasilan berulang dari tulisan mereka.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {role === 'platform_admin' ? (
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Ke Dashboard Admin
              </Link>
            ) : role ? (
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Ke Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Masuk
              </Link>
            )}
            <a
              href="#cara-kerja"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Pelajari lebih lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Untuk Siapa */}
      <section className="border-t border-border bg-muted/30 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Untuk Siapa
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Dibuat untuk penulis serius
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: '✍️',
                title: 'Penulis Solo',
                desc: 'Bangun newsletter premium, jurnal mingguan, atau blog analisis mendalam. Kamu yang menentukan harga dan audiensnya.',
              },
              {
                icon: '👥',
                title: 'Tim Penulis',
                desc: 'Undang co-author, kelola kontributor, dan terbitkan konten dari satu publication yang terorganisasi.',
              },
              {
                icon: '🎓',
                title: 'Komunitas & Kreator',
                desc: 'Dari newsletter edukasi hingga analisis industri — Lentera cocok untuk siapa saja yang punya sesuatu untuk diajarkan.',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 text-2xl">{card.icon}</div>
                <h3 className="mb-2 font-serif text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="border-t border-border px-6 py-16 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Fitur Utama
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Semua yang kamu butuhkan
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: '💳',
                title: 'Subscription berbayar',
                desc: 'Terima pembayaran dari subscriber dengan Midtrans. Pilih paket bulanan, 3 bulan, atau tahunan.',
              },
              {
                icon: '✏️',
                title: 'Editor rich text',
                desc: 'Tulis dengan editor berbasis Tiptap — heading, tabel, gambar, kode, dan lebih banyak lagi.',
              },
              {
                icon: '📊',
                title: 'Analytics & revenue',
                desc: 'Pantau jumlah subscriber, MRR, views, dan performa artikel dari satu dashboard.',
              },
              {
                icon: '📧',
                title: 'Email notifikasi',
                desc: 'Subscriber otomatis mendapat email saat artikel baru terbit. Reminder renewal juga terkirim otomatis.',
              },
            ].map((feat) => (
              <div key={feat.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <div className="shrink-0 text-xl">{feat.icon}</div>
                <div>
                  <h3 className="mb-1 font-serif text-sm font-semibold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="border-t border-border bg-muted/30 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Cara Kerja
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Tiga langkah memulai
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Buat Publication',
                desc: 'Daftarkan diri sebagai owner dan setup nama, slug, serta tampilan publication kamu.',
              },
              {
                step: '02',
                title: 'Tulis Konten',
                desc: 'Mulai dengan artikel gratis untuk membangun audiens, lalu tambahkan konten premium untuk subscriber.',
              },
              {
                step: '03',
                title: 'Terima Subscriber',
                desc: 'Reader bisa berlangganan lewat Midtrans. Kamu menerima pembayaran dikurangi platform fee 15%.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border">
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="mb-2 font-serif text-base font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
              <span className="font-serif text-[10px] font-semibold italic text-background">L</span>
            </div>
            <span>© 2026 Lentera. Platform Blog Subscription Indonesia.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Masuk
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

async function PlatformLandingContent() {
  const jar = await cookies();
  const role = jar.get('refreshToken') ? (jar.get('user-role')?.value ?? '') : '';
  return <PlatformLanding role={role} />;
}

export default function PlatformLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PlatformLandingContent />
    </Suspense>
  );
}
