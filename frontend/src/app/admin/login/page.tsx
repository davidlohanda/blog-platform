import { headers } from 'next/headers';
import { Suspense } from 'react';
import { PlatformAdminLoginForm } from './PlatformAdminLoginForm';
import { PublicationStaffLoginForm } from './PublicationStaffLoginForm';

export const metadata = { title: 'Masuk — Admin', robots: 'noindex' };

async function LoginFormSelector() {
  const h = await headers();
  const slug = h.get('x-publication-slug') ?? '';

  if (slug) {
    return <PublicationStaffLoginForm pubSlug={slug} />;
  }
  return <PlatformAdminLoginForm />;
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginFormSelector />
    </Suspense>
  );
}
