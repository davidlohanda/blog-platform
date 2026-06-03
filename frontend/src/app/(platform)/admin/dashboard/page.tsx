'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/layout/AdminShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface Overview {
  totalUsers: number;
  totalPublications: number;
  totalRevenue: number;
  platformFeeCollected: number;
}

interface Publication {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  platformFeePercent: number;
  createdAt: string;
  owner: { id: string; name: string; email: string } | null;
  activeSubscribers: number;
  activeMRR: number;
  totalArticles: number;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'platform_owner';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  _count: { subscriptions: number; publications: number };
}

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="font-serif text-3xl font-medium tracking-tight text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user: authUser } = useAuthStore();
  const isPlatformOwner = authUser?.role === 'platform_owner';

  const [overview, setOverview] = useState<Overview | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Add staff modal state
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const requests: Promise<unknown>[] = [
      apiClient.get<{ data: Overview }>('/admin/overview'),
      apiClient.get<{ data: { data: Publication[] } }>('/admin/publications'),
      apiClient.get<{ data: { data: User[] } }>('/admin/users'),
    ];
    if (isPlatformOwner) {
      requests.push(apiClient.get<{ data: Staff[] }>('/admin/staff'));
    }
    Promise.all(requests)
      .then((results) => {
        if (cancelled) return;
        const [ovRes, pubRes, userRes, staffRes] = results as [
          { data: { data: Overview } },
          { data: { data: { data: Publication[] } } },
          { data: { data: { data: User[] } } },
          { data: { data: Staff[] } } | undefined,
        ];
        setOverview(ovRes.data.data);
        setPublications(pubRes.data.data.data);
        setUsers(userRes.data.data.data);
        if (staffRes) setStaff(staffRes.data.data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isPlatformOwner]);

  async function handleAddStaff() {
    if (!newEmail || !newName) return;
    setAddLoading(true);
    setAddError('');
    try {
      const { data } = await apiClient.post<{ data: Staff }>('/admin/staff', { email: newEmail, name: newName });
      setStaff((prev) => [...prev, data.data]);
      setAddStaffOpen(false);
      setNewEmail('');
      setNewName('');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setAddError(apiErr?.response?.data?.message ?? 'Gagal menambahkan admin');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDeleteStaff(userId: string) {
    if (!confirm('Hapus admin ini?')) return;
    try {
      await apiClient.delete(`/admin/staff/${userId}`);
      setStaff((prev) => prev.filter((s) => s.id !== userId));
    } catch { /* ignore */ }
  }

  async function handleRoleChange(userId: string, role: 'platform_admin' | 'platform_owner') {
    try {
      const { data } = await apiClient.patch<{ data: Staff }>(`/admin/staff/${userId}/role`, { role });
      setStaff((prev) => prev.map((s) => (s.id === userId ? data.data : s)));
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <AdminShell title="Dashboard">
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted p-5" />
            ))}
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Overview seluruh platform Lentera"
      action={
        <Link href="/admin/invite" className={cn(buttonVariants({ size: 'sm' }))}>
          Invite Owner Baru
        </Link>
      }
    >
      <div className="space-y-8 p-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={overview?.totalUsers ?? 0} />
          <StatCard label="Total Publications" value={overview?.totalPublications ?? 0} />
          <StatCard
            label="Total Revenue"
            value={formatRp(overview?.totalRevenue ?? 0)}
            sub="dari semua subscription"
          />
          <StatCard
            label="Platform Fee"
            value={formatRp(overview?.platformFeeCollected ?? 0)}
            sub="15% dari revenue"
          />
        </div>

        {/* Publications table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Publications</h2>
            <Link href="/admin/publications" className="text-xs text-muted-foreground hover:text-foreground">
              Lihat semua →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publication</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Subscribers Aktif</TableHead>
                <TableHead className="text-right">MRR Aktif</TableHead>
                <TableHead className="text-right">Artikel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada publication
                  </TableCell>
                </TableRow>
              )}
              {publications.slice(0, 5).map((pub) => (
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
                      <Badge variant="secondary" className="text-[10px]">Belum ada owner</Badge>
                    )}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Users table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Users Terbaru</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Subscriptions</TableHead>
                <TableHead>Bergabung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada user
                  </TableCell>
                </TableRow>
              )}
              {users.slice(0, 10).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === 'platform_admin' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {u.role === 'platform_admin' ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {u._count.subscriptions}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', {
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
        {/* Platform Staff — platform_owner only */}
        {isPlatformOwner && (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Platform Staff</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Admin dan owner yang mengelola platform Lentera</p>
              </div>
              <Button size="sm" onClick={() => setAddStaffOpen(true)}>
                Tambah Admin
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      Belum ada staff
                    </TableCell>
                  </TableRow>
                )}
                {staff.map((s) => {
                  const isSelf = s.id === authUser?.id;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isSelf ? (
                          <Badge className="text-[10px]">
                            {s.role === 'platform_owner' ? 'Owner' : 'Admin'}
                          </Badge>
                        ) : (
                          <select
                            value={s.role}
                            onChange={(e) =>
                              handleRoleChange(s.id, e.target.value as 'platform_admin' | 'platform_owner')
                            }
                            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="platform_admin">Admin</option>
                            <option value="platform_owner">Owner</option>
                          </select>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        {!isSelf && s.role !== 'platform_owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteStaff(s.id)}
                          >
                            Hapus
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Add Staff Dialog */}
        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Platform Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nama</label>
                <Input
                  placeholder="Nama lengkap"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="email@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              {addError && <p className="text-sm text-destructive">{addError}</p>}
              <p className="text-xs text-muted-foreground">
                Admin baru akan menerima email berisi password sementara. Password harus diganti setelah login pertama.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setAddStaffOpen(false); setAddError(''); }}>
                Batal
              </Button>
              <Button onClick={handleAddStaff} disabled={addLoading || !newEmail || !newName}>
                {addLoading ? 'Menambahkan...' : 'Tambah Admin'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AdminShell>
  );
}
