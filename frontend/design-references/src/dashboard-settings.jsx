/* Dashboard — Settings with 3 tabs: General, Pricing, Authors */

function SettingsTabs({ active, onChange }) {
  const tabs = [
    ['general', 'Umum'],
    ['plans',   'Paket harga'],
    ['authors', 'Author'],
  ];
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '0 36px', display: 'flex', gap: 4 }}>
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)}
          style={{
            padding: '14px 14px',
            border: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: active === id ? 600 : 500,
            color: active === id ? 'var(--fg)' : 'var(--fg-3)',
            borderBottom: active === id ? '2px solid var(--fg)' : '2px solid transparent',
            marginBottom: -1,
            cursor: 'pointer',
          }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function DashSettingsRow({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, padding: '22px 0', borderTop: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {hint && <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ───── General tab ───── */
function GeneralTab() {
  return (
    <div style={{ maxWidth: 880 }}>
      <div className="card" style={{ padding: '4px 32px 28px' }}>
        <DashSettingsRow label="Nama publication" hint="Muncul di header, email, dan judul tab browser.">
          <input className="input" defaultValue="Lentera" style={{ maxWidth: 360 }} />
        </DashSettingsRow>

        <DashSettingsRow label="Deskripsi singkat" hint="Maks 160 karakter. Muncul di hasil pencarian dan preview link.">
          <textarea className="input" style={{ height: 84, padding: 12, lineHeight: 1.5, resize: 'none', maxWidth: 480 }}
            defaultValue="Tulisan-tulisan pelan untuk masa yang terburu-buru. Esai mingguan tentang ide, buku, dan cara berpikir." />
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 6 }}>128 / 160</div>
        </DashSettingsRow>

        <DashSettingsRow label="Logo" hint="PNG atau SVG dengan latar transparan. Rasio 1:1.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, background: 'var(--fg)', color: 'var(--bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 600, fontSize: 38 }}>L</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-outline btn-sm">Unggah logo baru</button>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>PNG · 240×240 · 14 KB</span>
            </div>
          </div>
        </DashSettingsRow>

        <DashSettingsRow label="Cover image" hint="Latar opsional untuk homepage. Lebar minimal 1600px.">
          <div className="placeholder-img" style={{ height: 120, maxWidth: 480 }} data-caption="klik atau drop gambar di sini"></div>
        </DashSettingsRow>

        <DashSettingsRow label="Custom domain" hint="Domain kamu sendiri. Kami otomatis mengurus SSL.">
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" defaultValue="lentera.id" />
              <button className="btn btn-outline btn-sm">Verifikasi</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'oklch(0.95 0.04 150)', borderRadius: 6, fontSize: 12.5, color: 'oklch(0.42 0.11 150)' }}>
              <Icon name="check" size={12} /> Domain aktif & SSL terpasang
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 8, fontFamily: 'var(--mono)' }}>Fallback URL: lentera.lentera-platform.com</div>
          </div>
        </DashSettingsRow>

        <DashSettingsRow label="Bahasa & timezone" hint="Mempengaruhi format tanggal dan penjadwalan.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 480 }}>
            <select className="input">
              <option>Bahasa Indonesia</option>
              <option>English</option>
            </select>
            <select className="input">
              <option>Asia/Jakarta (UTC+7)</option>
              <option>Asia/Singapore (UTC+8)</option>
            </select>
          </div>
        </DashSettingsRow>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm">Batal</button>
          <button className="btn btn-primary btn-sm">Simpan pengaturan</button>
        </div>
      </div>
    </div>
  );
}

/* ───── Plans tab ───── */
function PlansTab() {
  const plans = [
    { id: '1m',  label: '1 Bulan',  price: 39000,  enabled: true,  desc: 'Cicipi dulu — paling fleksibel' },
    { id: '3m',  label: '3 Bulan',  price: 35000,  enabled: true,  desc: 'Untuk yang siap baca konsisten' },
    { id: '6m',  label: '6 Bulan',  price: 32000,  enabled: true,  desc: 'Paket yang paling populer' },
    { id: '12m', label: '12 Bulan', price: 28000,  enabled: false, desc: 'Hemat paling banyak' },
  ];

  return (
    <div style={{ maxWidth: 880 }}>
      {/* Currency */}
      <div className="card" style={{ padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Mata uang & PPN</div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Indonesian Rupiah (IDR) · PPN 11% termasuk dalam harga</div>
        </div>
        <button className="btn btn-outline btn-sm">Ubah</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="serif-title" style={{ fontSize: 18, margin: '0 0 2px' }}>Tier subscription</h3>
            <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Atur harga dan ketersediaan tiap paket. Perubahan tidak mempengaruhi subscriber existing.</div>
          </div>
        </div>

        {plans.map((p, i) => (
          <div key={p.id} style={{ padding: '20px 28px', borderTop: i === 0 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 220px 140px 60px', gap: 20, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: p.enabled ? 'var(--surface)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17, opacity: p.enabled ? 1 : 0.5 }}>
                {p.id.replace('m', '')}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{p.desc}</div>
              </div>
            </div>

            <div>
              <label className="label" style={{ marginBottom: 4 }}>Harga / bulan</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '0 10px', height: 36, display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--fg-3)' }}>Rp</span>
                <input className="input" defaultValue={p.price.toLocaleString('id-ID')} disabled={!p.enabled} style={{ borderRadius: '0 6px 6px 0', fontFamily: 'var(--mono)', fontSize: 13, height: 36, opacity: p.enabled ? 1 : 0.5 }} />
              </div>
            </div>

            <div>
              <label className="label" style={{ marginBottom: 4 }}>Status</label>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--border-2)', background: 'var(--bg-elev)', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, width: '100%' }}>
                <span style={{ width: 26, height: 14, borderRadius: 7, background: p.enabled ? 'var(--success)' : 'var(--border-2)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 1, left: p.enabled ? 13 : 1, width: 12, height: 12, borderRadius: 6, background: '#fff', transition: 'left .15s' }}></span>
                </span>
                <span style={{ color: p.enabled ? 'var(--fg)' : 'var(--fg-3)' }}>{p.enabled ? 'Aktif' : 'Mati'}</span>
              </button>
            </div>

            <button className="btn btn-ghost btn-icon btn-sm"><Icon name="menu" size={14} /></button>
          </div>
        ))}

        <div style={{ padding: '16px 28px', background: 'var(--surface)', borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="comment" size={13} /> Subscriber paket 12 Bulan yang sudah ada tetap aktif sampai periode mereka selesai, walaupun tier dinonaktifkan.
        </div>
      </div>

      {/* Promo */}
      <div className="card" style={{ padding: 24, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Kode promo</div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Buat kode diskon untuk kampanye atau referral. 3 kode aktif.</div>
        </div>
        <button className="btn btn-outline">Kelola kode promo</button>
      </div>
    </div>
  );
}

/* ───── Authors tab ───── */
function AuthorsTab() {
  const team = [
    { ...AUTHORS[0], role: 'Owner',  joined: 'Mei 2023',  articles: 38 },
    { ...AUTHORS[1], role: 'Editor', joined: 'Jul 2023',  articles: 42 },
    { ...AUTHORS[2], role: 'Author', joined: 'Mar 2024',  articles: 28 },
  ];

  return (
    <div style={{ maxWidth: 880 }}>
      {/* Invite */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 className="serif-title" style={{ fontSize: 18, margin: '0 0 6px' }}>Undang author baru</h3>
        <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: '0 0 16px' }}>Author yang diundang akan menerima email berisi tautan untuk bergabung. Maks 5 author di tier saat ini.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8 }}>
          <input className="input" placeholder="Email author" />
          <select className="input">
            <option>Author — bisa menulis & terbit sendiri</option>
            <option>Editor — bisa edit semua artikel</option>
            <option>Contributor — perlu approval untuk terbit</option>
          </select>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Kirim undangan</button>
        </div>
      </div>

      {/* Pending */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: 16, background: 'var(--accent-soft)', border: '1px solid oklch(0.85 0.07 70)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="clock" size={16} color="var(--accent-ink)" />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent-ink)' }}>1 undangan menunggu</div>
              <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', opacity: .8 }}>kirana.zw@gmail.com · diundang 3 hari lalu sebagai Author</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-ink)' }}>Kirim ulang</button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-ink)' }}>Batalkan</button>
          </div>
        </div>
      </div>

      {/* Team table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="serif-title" style={{ fontSize: 18, margin: 0 }}>Tim author · {team.length}</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Artikel</th>
              <th>Bergabung</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {team.map((m, i) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar size="lg" author={m} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)', maxWidth: 360 }}>{m.bio}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select defaultValue={m.role} disabled={m.role === 'Owner'} className="input" style={{ height: 32, fontSize: 13, padding: '0 8px', width: 110 }}>
                    <option>Owner</option>
                    <option>Editor</option>
                    <option>Author</option>
                    <option>Contributor</option>
                  </select>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>{m.articles}</td>
                <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>{m.joined}</td>
                <td>
                  <button className="btn btn-ghost btn-icon btn-sm" disabled={m.role === 'Owner'} style={{ opacity: m.role === 'Owner' ? .3 : 1 }}>
                    <Icon name="menu" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role explanation */}
      <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--surface)', borderRadius: 10, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--fg)' }}>Peran:</strong> Owner punya akses penuh termasuk billing.
        Editor bisa mengedit semua artikel termasuk milik orang lain.
        Author bisa menulis & menerbitkan tulisannya sendiri.
        Contributor bisa menulis tapi tulisan harus disetujui dulu sebelum terbit.
      </div>
    </div>
  );
}

function DashboardSettings() {
  const [tab, setTab] = React.useState('general');
  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="settings-general" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Pengaturan"
          subtitle="Atur publication, harga paket, dan tim author."
        />
        <SettingsTabs active={tab} onChange={setTab} />
        <div style={{ padding: 36, flex: 1 }}>
          {tab === 'general' && <GeneralTab />}
          {tab === 'plans'   && <PlansTab />}
          {tab === 'authors' && <AuthorsTab />}
        </div>
      </div>
    </div>
  );
}

window.DashboardSettings = DashboardSettings;
