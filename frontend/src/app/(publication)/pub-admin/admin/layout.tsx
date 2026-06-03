import type { ReactNode } from 'react';

// Auth pages (/admin/login, /admin/forgot-password, /admin/reset-password) are public.
// Dashboard is guarded at the dashboard/layout.tsx level with full role verification.
export default function PubAdminStaffLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
