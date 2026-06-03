import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 9v6M14 19h.01M4 14C4 8.477 8.477 4 14 4s10 4.477 10 10-4.477 10-10 10S4 19.523 4 14z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          />
        </svg>
      </div>
      <h1 className="mb-3 font-serif text-2xl font-semibold text-foreground">
        Publication Tidak Tersedia
      </h1>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
        Publication ini sedang dalam proses peninjauan atau telah ditangguhkan oleh tim Lentera.
        Silakan coba lagi nanti atau hubungi kami jika ada pertanyaan.
      </p>
      <Link
        href="/"
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
