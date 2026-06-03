'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/AdminShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type PubStatus = 'active' | 'suspended_soft' | 'suspended_hard' | 'pending_deletion';

interface Publication {
  id: string;
  slug: string;
  name: string;
  platformFeePercent: number;
  status: PubStatus;
  createdAt: string;
  owner: { id: string; name: string; email: string } | null;
  activeSubscribers: number;
  activeMRR: number;
  activePlatformFee: number;
  totalSubscriptions: number;
  totalArticles: number;
}

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

const STATUS_LABELS: Record<PubStatus, string> = {
  active: 'Aktif',
  suspended_soft: 'Dalam Peninjauan',
  suspended_hard: 'Ditangguhkan',
  pending_deletion: 'Menunggu Hapus',
};

const STATUS_VARIANT: Record<PubStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  suspended_soft: 'secondary',
  suspended_hard: 'destructive',
  pending_deletion: 'outline',
};

export default function AdminPublicationsPage() {
  const router = useRouter();
  const { setImpersonation } = useAuthStore();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fee dialog state
  const [feeDialog, setFeeDialog] = useState<{ pub: Publication } | null>(null);
  const [feeValue, setFeeValue] = useState('');
  const [feeSaving, setFeeSaving] = useState(false);

  // Suspend dialog state
  const [suspendDialog, setSuspendDialog] = useState<{ pub: Publication } | null>(null);
  const [suspendLevel, setSuspendLevel] = useState<1 | 2>(1);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspending, setSuspending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: { data: Publication[]; total: number } }>('/admin/publications?limit=50')
      .then(({ data }) => {
        if (cancelled) return;
        setPublications(data.data.data);
        setTotal(data.data.total);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleFeeUpdate() {
    if (!feeDialog) return;
    const pct = parseFloat(feeValue);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    setFeeSaving(true);
    try {
      await apiClient.patch(`/admin/publications/${feeDialog.pub.id}/fee`, { feePercent: pct });
      setPublications((prev) =>
        prev.map((p) => (p.id === feeDialog.pub.id ? { ...p, platformFeePercent: pct } : p)),
      );
      setFeeDialog(null);
    } catch {
      // ignore
    } finally {
      setFeeSaving(false);
    }
  }

  async function handleImpersonate(ownerId: string) {
    try {
      const { data } = await apiClient.post<{
        data: {
          accessToken: string;
          user: { id: string; email: string; name: string; role: string; avatarUrl: string | null; emailVerifiedAt: string | null };
        };
      }>(`/admin/impersonate/${ownerId}`);
      setImpersonation(data.data.accessToken, {
        ...data.data.user,
      });
      router.push('/admin/dashboard');
    } catch {
      // ignore
    }
  }

  async function handleSuspend() {
    if (!suspendDialog) return;
    if (!suspendReason.trim()) return;
    setSuspending(true);
    try {
      await apiClient.patch(`/admin/publications/${suspendDialog.pub.id}/suspend`, {
        level: suspendLevel,
        reason: suspendReason,
      });
      const newStatus: PubStatus = suspendLevel === 1 ? 'suspended_soft' : 'suspended_hard';
      setPublications((prev) =>
        prev.map((p) => (p.id === suspendDialog.pub.id ? { ...p, status: newStatus } : p)),
      );
      setSuspendDialog(null);
      setSuspendReason('');
    } catch {
      // ignore
    } finally {
      setSuspending(false);
    }
  }

  async function handleUnsuspend(pub: Publication) {
    try {
      await apiClient.patch(`/admin/publications/${pub.id}/unsuspend`);
      setPublications((prev) =>
        prev.map((p) => (p.id === pub.id ? { ...p, status: 'active' } : p)),
      );
    } catch {
      // ignore
    }
  }

  return (
    <AdminShell
      title="Publications"
      subtitle={`${total} publication terdaftar`}
      action={
        <Link href="/admin/invite" className={cn(buttonVariants({ size: 'sm' }))}>
          Invite Owner Baru
        </Link>
      }
    >
      <div className="p-8">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publication</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Subscribers</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Artikel</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    Memuat…
                  </TableCell>
                </TableRow>
              )}
              {!loading && publications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada publication
                  </TableCell>
                </TableRow>
              )}
              {publications.map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{pub.name}</p>
                      <p className="text-xs text-muted-foreground">{pub.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pub.owner ? (
                      <div>
                        <p className="text-sm text-foreground">{pub.owner.name}</p>
                        <p className="text-xs text-muted-foreground">{pub.owner.email}</p>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Menunggu owner
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[pub.status]} className="text-[10px]">
                      {STATUS_LABELS[pub.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setFeeDialog({ pub });
                        setFeeValue(String(pub.platformFeePercent));
                      }}
                      className="text-sm tabular-nums text-foreground underline-offset-2 hover:underline"
                    >
                      {pub.platformFeePercent}%
                    </button>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {pub.activeSubscribers}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatRp(pub.activeMRR)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {pub.totalArticles}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(pub.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Impersonate */}
                      {pub.owner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleImpersonate(pub.owner!.id)}
                        >
                          Masuk sebagai Owner
                        </Button>
                      )}
                      {/* Suspend / Unsuspend */}
                      {pub.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20"
                          onClick={() => {
                            setSuspendDialog({ pub });
                            setSuspendLevel(1);
                            setSuspendReason('');
                          }}
                        >
                          Suspend
                        </Button>
                      )}
                      {(pub.status === 'suspended_soft' || pub.status === 'suspended_hard') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                          onClick={() => handleUnsuspend(pub)}
                        >
                          Aktifkan
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Fee Edit Dialog */}
      <Dialog open={!!feeDialog} onOpenChange={(open: boolean) => !open && setFeeDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Platform Fee</DialogTitle>
            <DialogDescription>
              Publication: <strong>{feeDialog?.pub.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Platform fee (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
              />
              {feeValue && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Publication akan menerima{' '}
                  <span className="font-medium text-foreground">
                    {(100 - parseFloat(feeValue)).toFixed(1)}%
                  </span>{' '}
                  dari setiap transaksi.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFeeDialog(null)}>
                Batal
              </Button>
              <Button onClick={() => { void handleFeeUpdate(); }} disabled={feeSaving}>
                {feeSaving ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog
        open={!!suspendDialog}
        onOpenChange={(open: boolean) => !open && setSuspendDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend Publication</DialogTitle>
            <DialogDescription>
              <strong>{suspendDialog?.pub.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Tingkat suspend</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSuspendLevel(1)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    suspendLevel === 1
                      ? 'border-foreground bg-foreground/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <p className="font-semibold">Level 1</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Owner tidak bisa publish. Member masih bisa baca.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSuspendLevel(2)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    suspendLevel === 2
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <p className="font-semibold text-destructive">Level 2</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Seluruh publication tidak bisa diakses. Refund pro-rata ke semua member.
                  </p>
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Alasan <span className="text-destructive">*</span>
              </label>
              <textarea
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                placeholder="Jelaskan alasan suspension…"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
            {suspendLevel === 2 && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                ⚠️ Level 2 akan memicu refund pro-rata ke semua subscriber aktif dan email notifikasi
                ke semua member.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSuspendDialog(null)}>
                Batal
              </Button>
              <Button
                variant={suspendLevel === 2 ? 'destructive' : 'default'}
                onClick={() => { void handleSuspend(); }}
                disabled={!suspendReason.trim() || suspending}
              >
                {suspending ? 'Memproses…' : `Suspend Level ${suspendLevel}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
