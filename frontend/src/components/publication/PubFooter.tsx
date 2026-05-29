import Link from 'next/link';
import type { Publication } from '@/lib/pub-data';

export function PubFooter({ pub }: { pub: Publication }) {
  const domain = pub.customDomain ?? `${pub.slug}.lentera.id`;
  return (
    <footer className="mt-20 border-t border-border px-4 pb-8 pt-10 text-sm text-muted-foreground md:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="mb-3 font-heading text-base font-semibold text-foreground">
              {pub.name}
            </div>
            {pub.description && (
              <p className="leading-relaxed">{pub.description}</p>
            )}
          </div>
          <div className="flex gap-12">
            <div>
              <div className="mb-3 font-semibold text-foreground">Konten</div>
              <div className="flex flex-col gap-2">
                <Link href="/" className="hover:text-foreground">Artikel terbaru</Link>
                <Link href="/series" className="hover:text-foreground">Series</Link>
              </div>
            </div>
            <div>
              <div className="mb-3 font-semibold text-foreground">Lainnya</div>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="hover:text-foreground">Tentang penulis</Link>
                <Link href="/subscribe" className="hover:text-foreground">Berlangganan</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
          <span>© {new Date().getFullYear()} {pub.name}</span>
          <span>{domain}</span>
        </div>
      </div>
    </footer>
  );
}
