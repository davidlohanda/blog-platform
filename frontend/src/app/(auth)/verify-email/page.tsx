import Link from 'next/link';
import { serverFetch } from '@/lib/api/server';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyShell
        success={false}
        message="Token verifikasi tidak ditemukan. Pastikan kamu mengklik link dari email dengan benar."
      />
    );
  }

  try {
    await serverFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return <VerifyShell success={true} message="Email kamu berhasil diverifikasi. Sekarang kamu bisa masuk." />;
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Token tidak valid atau sudah kedaluwarsa.';
    return <VerifyShell success={false} message={msg} />;
  }
}

function VerifyShell({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f7f4] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#e8e2d9]">
        <div
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded-full ${
            success ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          {success ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11l5 5 9-9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 7v5M11 15h.01" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <h1 className="mb-2 font-serif text-2xl font-medium text-[#2a261f]">
          {success ? 'Email terverifikasi' : 'Verifikasi gagal'}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[#5a5348]">{message}</p>

        {success ? (
          <Link
            href="/login"
            className="block w-full rounded-lg bg-[#2a261f] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#1a1710]"
          >
            Masuk sekarang
          </Link>
        ) : (
          <Link
            href="/register"
            className="block w-full rounded-lg border border-[#d4cdc4] py-2.5 text-center text-sm font-medium text-[#2a261f] transition hover:bg-[#f9f7f4]"
          >
            Kembali ke halaman daftar
          </Link>
        )}
      </div>
    </div>
  );
}
