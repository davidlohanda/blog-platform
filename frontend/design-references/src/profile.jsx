/* Personal — Profile Settings + Subscription Settings */

/* Shared member account chrome */
function MemberSidebar({ active }) {
  const items = [
    ['library',      'bookmark', 'Library'],
    ['profile',      'user',     'Profile'],
    ['subscription', 'dollar',   'Subscription'],
    ['notification', 'eye',      'Notifikasi'],
  ];
  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '0 6px' }}>
        <Avatar size="lg" author={{ id: 'rina', initials: 'RA' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Rina Astari</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Member sejak 2024</div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, padding: '0 6px' }}>
        Akun
      </div>
      <div style={{ display: 'grid', gap: 2 }}>
        {items.map(([id, icon, label]) => (
          <div key={id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              background: active === id ? 'var(--surface-2)' : 'transparent',
              color: active === id ? 'var(--fg)' : 'var(--fg-2)',
              cursor: 'pointer',
            }}>
            <Icon name={icon} size={15} /> {label}
          </div>
        ))}
      </div>
      <hr className="divider" style={{ margin: '18px 0' }} />
      <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--fg-3)' }}>
        <Icon name="arrowLeft" size={13} /> Keluar
      </button>
    </aside>
  );
}

function SettingsRow({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, padding: '24px 0', borderTop: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {hint && <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="pub-page scroll-y">
      <TopBar isMember />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 64px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Akun</div>
          <h1 className="serif-title" style={{ fontSize: 36, margin: 0, letterSpacing: '-0.02em' }}>Pengaturan profil</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'flex-start' }}>
          <MemberSidebar active="profile" />

          <main>
            <div className="card" style={{ padding: '4px 32px 32px' }}>
              <SettingsRow label="Foto profil" hint="JPG, PNG, atau GIF. Maksimum 2 MB.">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size="xl" author={{ id: 'rina', initials: 'RA' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm">Ganti foto</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Hapus</button>
                  </div>
                </div>
              </SettingsRow>

              <SettingsRow label="Nama lengkap" hint="Nama yang ditampilkan di komentar dan profil.">
                <input className="input" defaultValue="Rina Astari" style={{ maxWidth: 360 }} />
              </SettingsRow>

              <SettingsRow label="Username" hint="Digunakan di URL profil kamu: lentera.id/@username">
                <div style={{ display: 'flex', alignItems: 'center', maxWidth: 360 }}>
                  <span style={{ padding: '0 12px', height: 40, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRight: 'none', borderRadius: '8px 0 0 8px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg-3)' }}>@</span>
                  <input className="input" defaultValue="rinaastari" style={{ borderRadius: '0 8px 8px 0' }} />
                </div>
              </SettingsRow>

              <SettingsRow label="Email" hint="Notifikasi dan tagihan dikirim ke alamat ini.">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 420 }}>
                  <input className="input" defaultValue="rina@email.com" />
                  <span className="badge badge-success">Terverifikasi</span>
                </div>
              </SettingsRow>

              <SettingsRow label="Bio singkat" hint="Maks 160 karakter. Muncul di profil kamu dan di kolom komentar.">
                <textarea className="input" style={{ height: 80, padding: 12, lineHeight: 1.5, resize: 'none', maxWidth: 480 }}
                  defaultValue="Pembaca lambat dan pencatat ulasan untuk diri sendiri. Suka esai pendek, kopi tidak terlalu pahit, dan hari yang tidak terlalu penuh." />
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 6 }}>122 / 160 karakter</div>
              </SettingsRow>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-ghost btn-sm">Batalkan perubahan</button>
                <button className="btn btn-primary btn-sm">Simpan profil</button>
              </div>
            </div>

            {/* Password card */}
            <div className="card" style={{ padding: 32, marginTop: 24 }}>
              <h2 className="serif-title" style={{ fontSize: 22, margin: '0 0 6px' }}>Kata sandi</h2>
              <p style={{ fontSize: 13.5, color: 'var(--fg-3)', margin: '0 0 24px' }}>Ganti kata sandi kamu. Kamu akan tetap masuk di perangkat ini setelah berhasil.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 640 }}>
                <div>
                  <label className="label">Kata sandi saat ini</label>
                  <input className="input" type="password" placeholder="••••••••" />
                </div>
                <div></div>
                <div>
                  <label className="label">Kata sandi baru</label>
                  <input className="input" type="password" placeholder="Minimal 8 karakter" />
                </div>
                <div>
                  <label className="label">Ulangi kata sandi baru</label>
                  <input className="input" type="password" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button className="btn btn-outline btn-sm">Simpan kata sandi</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--fg-3)' }}>Saya lupa kata sandi saat ini</button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="card" style={{ padding: 24, marginTop: 24, borderColor: 'oklch(0.85 0.08 25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Hapus akun</div>
                  <div style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>Tindakan permanen. Library, komentar, dan profil kamu akan dihapus seluruhnya.</div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'oklch(0.85 0.08 25)' }}>Hapus akun…</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSettings() {
  const transactions = [
    { date: '15 Feb 2026', desc: 'Perpanjangan otomatis · 6 bulan',  amount: 192000, status: 'paid',   method: 'GoPay' },
    { date: '15 Aug 2025', desc: 'Berlangganan · 6 bulan',           amount: 192000, status: 'paid',   method: 'BCA VA' },
    { date: '15 Feb 2025', desc: 'Perpanjangan otomatis · 6 bulan',  amount: 180000, status: 'paid',   method: 'GoPay' },
    { date: '15 Aug 2024', desc: 'Berlangganan · 6 bulan',           amount: 180000, status: 'paid',   method: 'QRIS' },
  ];

  return (
    <div className="pub-page scroll-y">
      <TopBar isMember />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 64px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Akun</div>
          <h1 className="serif-title" style={{ fontSize: 36, margin: 0, letterSpacing: '-0.02em' }}>Subscription</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'flex-start' }}>
          <MemberSidebar active="subscription" />

          <main>
            {/* Active plan card */}
            <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--accent)' }}></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span className="badge badge-accent badge-dot">Aktif</span>
                    <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Paket 6 Bulan · Perpanjangan otomatis</span>
                  </div>
                  <h2 className="serif-title" style={{ fontSize: 30, margin: '0 0 8px' }}>Member Lentera</h2>
                  <p style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 420 }}>
                    Berlangganan sejak 15 Agustus 2024. Tagihan berikutnya: 15 Agustus 2026 — sekitar 88 hari lagi.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm">Ganti paket</button>
                    <button className="btn btn-ghost btn-sm">Metode pembayaran</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginBottom: 4 }}>Per bulan</div>
                  <div className="serif-title" style={{ fontSize: 32 }}>Rp 32.000</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>Total Rp 192.000 / 6 bln</div>
                </div>
              </div>

              {/* Progress bar — time elapsed */}
              <div style={{ marginTop: 28, padding: '14px 18px', background: 'var(--surface)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Periode aktif</span>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>15 Feb 2026 → 15 Agu 2026</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '51%', background: 'var(--fg)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: 'var(--fg-3)' }}>
                  <span>92 hari berjalan</span>
                  <span>88 hari tersisa</span>
                </div>
              </div>
            </div>

            {/* Manage */}
            <div className="card" style={{ padding: 32, marginTop: 20 }}>
              <h3 className="serif-title" style={{ fontSize: 20, margin: '0 0 16px' }}>Kelola</h3>
              <div style={{ display: 'grid', gap: 4 }}>
                {[
                  ['Aktifkan/matikan perpanjangan otomatis', 'Saat ini: aktif', 'Matikan'],
                  ['Ganti tanggal tagihan',                  'Setiap tanggal 15',  'Ubah'],
                  ['Unduh invoice',                           '4 invoice tersedia', 'Unduh semua'],
                ].map(([t, s, btn]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{s}</div>
                    </div>
                    <button className="btn btn-outline btn-sm">{btn}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction history */}
            <div className="card" style={{ padding: 0, marginTop: 20, overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="serif-title" style={{ fontSize: 20, margin: 0 }}>Riwayat transaksi</h3>
                <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Unduh semua (PDF)</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Deskripsi</th>
                    <th>Metode</th>
                    <th style={{ textAlign: 'right' }}>Jumlah</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 13.5 }}>{t.date}</td>
                      <td style={{ fontSize: 13.5 }}>{t.desc}</td>
                      <td style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>{t.method}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>Rp {t.amount.toLocaleString('id-ID')}</td>
                      <td><span className="badge badge-success">Lunas</span></td>
                      <td><button className="btn btn-ghost btn-icon btn-sm"><Icon name="download" size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cancel */}
            <div className="card" style={{ padding: 24, marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Berhenti berlangganan</div>
                  <div style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.55, maxWidth: 540 }}>
                    Akses kamu akan tetap aktif sampai akhir periode (15 Agu 2026). Setelah itu kamu masih bisa membaca artikel gratis seperti biasa.
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'oklch(0.85 0.08 25)' }}>Batalkan berlangganan</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

window.ProfileSettings = ProfileSettings;
window.SubscriptionSettings = SubscriptionSettings;
