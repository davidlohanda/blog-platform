'use client';

import { useState, useEffect } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Publication {
  id: string;
  slug: string;
  name: string;
  platformFeePercent: number;
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

export default function AdminPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Subscribers Aktif</TableHead>
                <TableHead className="text-right">MRR</TableHead>
                <TableHead className="text-right">Fee Terkumpul</TableHead>
                <TableHead className="text-right">Artikel</TableHead>
                <TableHead>Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Memuat…
                  </TableCell>
                </TableRow>
              )}
              {!loading && publications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
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
                      <Badge variant="secondary" className="text-[10px]">Menunggu owner</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {pub.platformFeePercent}%
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {pub.activeSubscribers}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatRp(pub.activeMRR)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatRp(pub.activePlatformFee)}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminShell>
  );
}
