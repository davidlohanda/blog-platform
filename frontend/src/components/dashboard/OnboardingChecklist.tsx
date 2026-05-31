'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

interface OnboardingStatus {
  has_subscription_plans: boolean;
  has_articles: boolean;
  has_logo: boolean;
  has_custom_domain: boolean;
}

interface ChecklistItem {
  key: keyof OnboardingStatus;
  label: string;
  description: string;
  href: string;
  linkLabel: string;
}

const ITEMS: ChecklistItem[] = [
  {
    key: 'has_subscription_plans',
    label: 'Set harga subscription',
    description: 'Tentukan paket dan harga agar reader bisa berlangganan.',
    href: '/dashboard/settings',
    linkLabel: 'Atur harga',
  },
  {
    key: 'has_articles',
    label: 'Tulis artikel pertama',
    description: 'Publikasikan artikel pertamamu untuk mulai membangun audiens.',
    href: '/dashboard/articles/new',
    linkLabel: 'Tulis sekarang',
  },
  {
    key: 'has_logo',
    label: 'Upload logo publication',
    description: 'Logo membuat halaman publicationmu terlihat profesional.',
    href: '/dashboard/settings',
    linkLabel: 'Upload logo',
  },
  {
    key: 'has_custom_domain',
    label: 'Setup custom domain',
    description: 'Gunakan domain sendiri untuk tampil lebih branded.',
    href: '/dashboard/settings',
    linkLabel: 'Setup domain',
  },
];

export function OnboardingChecklist({ pubId }: { pubId: string }) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: OnboardingStatus }>(`/publications/${pubId}/onboarding-status`)
      .then(({ data }) => { if (!cancelled) setStatus(data.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pubId]);

  if (!status || dismissed) return null;

  const completed = ITEMS.filter((item) => status[item.key]).length;
  const allDone = completed === ITEMS.length;

  if (allDone) return null;

  const progressPct = Math.round((completed / ITEMS.length) * 100);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Setup publication kamu</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {completed} dari {ITEMS.length} langkah selesai
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sembunyikan
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-3">
        {ITEMS.map((item) => {
          const done = status[item.key];
          return (
            <div key={item.key} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? 'border-foreground bg-foreground'
                    : 'border-border bg-background'
                }`}
              >
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 2.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      done ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                  {!done && (
                    <Link
                      href={item.href}
                      className="text-xs font-medium text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      {item.linkLabel} →
                    </Link>
                  )}
                </div>
                {!done && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
