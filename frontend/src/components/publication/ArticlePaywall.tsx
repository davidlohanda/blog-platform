import Link from 'next/link';

interface Props {
  pubName: string;
  pubId: string;
  articleSlug: string;
}

export function ArticlePaywall({ pubName, pubId, articleSlug }: Props) {
  const subscribeHref = `/subscribe?pub=${pubId}&next=${encodeURIComponent(articleSlug)}`;

  return (
    <div className="relative mt-0">
      {/* Fade from content into paywall */}
      <div className="pointer-events-none h-28 bg-gradient-to-b from-transparent to-background" />

      <div className="rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-sm">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          🔒 Sisa tulisan untuk member
        </span>

        <h2 className="mx-auto mb-3 max-w-md font-heading text-2xl font-semibold leading-snug">
          Selebihnya tersedia untuk pelanggan {pubName}
        </h2>

        <p className="mx-auto mb-6 max-w-sm text-base leading-relaxed text-muted-foreground">
          Berlangganan untuk membaca tulisan ini sampai habis, plus akses ke seluruh arsip dan
          konten baru tiap pekan.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={subscribeHref}
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-foreground/90"
          >
            Berlangganan sekarang
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Akses langsung setelah bayar · Batalkan kapan saja
        </p>

        <div className="mt-6 flex justify-center gap-8 border-t border-border pt-6">
          {[
            ['Akses penuh', 'Semua tulisan di arsip'],
            ['Konten eksklusif', 'Artikel premium tiap pekan'],
            ['Komunitas', 'Diskusi & komentar member'],
          ].map(([title, desc]) => (
            <div key={title} className="max-w-[140px] text-left">
              <div className="mb-1 text-sm font-semibold">{title}</div>
              <div className="text-xs leading-snug text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
