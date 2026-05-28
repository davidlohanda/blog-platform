/* Dashboard — Series Management (create / arrange) */

const ALL_SERIES = [
  { id: 's1', title: 'Belajar Membaca Pelan',          author: AUTHORS[0], count: 6, published: 4, status: 'active',  cover: 'reading' },
  { id: 's2', title: 'Catatan untuk Diri yang Sibuk',  author: AUTHORS[1], count: 5, published: 5, status: 'active',  cover: 'desk' },
  { id: 's3', title: 'Mengganti Scroll dengan Bacaan', author: AUTHORS[2], count: 4, published: 0, status: 'draft',   cover: 'phone' },
];

const EDITING_SERIES = {
  title: 'Belajar Membaca Pelan',
  subtitle: 'Enam esai pendek tentang membaca, perhatian, dan apa yang kita lupakan saat scrolling.',
  author: AUTHORS[0],
  items: [
    { num: 1, title: 'Membaca Pelan adalah Bentuk Perlawanan', status: 'published', date: '18 Mei 2026' },
    { num: 2, title: 'Buku Bukan Konten — dan Kita Bukan Audiens', status: 'published', date: '11 Mei 2026' },
    { num: 3, title: 'Pensil di Tangan: Praktik Marginalia yang Hilang', status: 'published', date: '4 Mei 2026' },
    { num: 4, title: 'Tiga Puluh Menit, Tanpa Layar', status: 'published', date: '28 Apr 2026' },
    { num: 5, title: 'Berhenti Tanpa Bersalah', status: 'scheduled', date: 'Terjadwal 25 Mei' },
    { num: 6, title: 'Kembali ke Dunia Setelah Membaca Lama', status: 'draft', date: 'Diedit kemarin' },
  ],
};

function DashboardSeries() {
  const [editing, setEditing] = React.useState(true); // show editing pane by default

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="series" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Series"
          subtitle={`${ALL_SERIES.length} series · ${ALL_SERIES.reduce((s, x) => s + x.count, 0)} artikel dalam series`}
          action={<button className="btn btn-primary"><Icon name="plus" size={14} /> Series baru</button>}
        />
        <div style={{ padding: 36, flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'flex-start' }}>
          {/* Left — list of series */}
          <aside>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input className="input" placeholder="Cari series…" />
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {ALL_SERIES.map((s, i) => (
                <button key={s.id} onClick={() => setEditing(i === 0)}
                  style={{
                    textAlign: 'left',
                    padding: 14,
                    borderRadius: 10,
                    background: i === 0 ? 'var(--surface-2)' : 'var(--bg-elev)',
                    border: i === 0 ? '1.5px solid var(--fg)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    gap: 12,
                  }}>
                  <div className="placeholder-img" style={{ width: 60, height: 78, flexShrink: 0 }} data-caption=""></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      {s.status === 'draft'
                        ? <span className="badge badge-soft">Draft</span>
                        : <span className="badge badge-success badge-dot">Aktif</span>}
                    </div>
                    <div className="serif-title" style={{ fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar size="sm" author={s.author} />
                      <span>{s.author.name.split(' ')[0]}</span>
                      <span>·</span>
                      <span>{s.published}/{s.count} terbit</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Right — series editor */}
          <main className="card" style={{ padding: 0 }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Series</div>
                <h2 className="serif-title" style={{ fontSize: 24, margin: '0 0 8px', letterSpacing: '-0.015em' }}>{EDITING_SERIES.title}</h2>
                <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.5, margin: 0, maxWidth: 540 }}>{EDITING_SERIES.subtitle}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm"><Icon name="eye" size={13} /> Preview</button>
                <button className="btn btn-outline btn-sm">Pengaturan</button>
              </div>
            </div>

            {/* Quick info */}
            <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar size="sm" author={EDITING_SERIES.author} />
                <span style={{ color: 'var(--fg-2)' }}>oleh <strong>{EDITING_SERIES.author.name}</strong></span>
              </div>
              <div style={{ width: 1, height: 16, background: 'var(--border)' }}></div>
              <span style={{ color: 'var(--fg-2)' }}><strong>{EDITING_SERIES.items.filter(i => i.status === 'published').length}</strong> dari {EDITING_SERIES.items.length} terbit</span>
              <span style={{ color: 'var(--fg-2)' }}>· 1 terjadwal · 1 draft</span>
              <div style={{ flex: 1 }}></div>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>URL: <span style={{ fontFamily: 'var(--mono)' }}>lentera.id/series/belajar-membaca-pelan</span></span>
            </div>

            {/* Items list — drag to reorder */}
            <div style={{ padding: '20px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="serif-title" style={{ fontSize: 16 }}>Urutan bagian</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Tarik baris untuk mengubah urutan</div>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                {EDITING_SERIES.items.map((it, i) => {
                  const statusBadge = it.status === 'published'
                    ? <span className="badge badge-success badge-dot">Terbit</span>
                    : it.status === 'scheduled'
                      ? <span className="badge badge-accent">Terjadwal</span>
                      : <span className="badge badge-soft">Draft</span>;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--fg-4)', cursor: 'grab', fontSize: 14 }}>⋮⋮</span>
                      <div style={{ width: 30, height: 30, borderRadius: 15, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', flexShrink: 0 }}>
                        {it.num}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{it.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{it.date}</div>
                      </div>
                      {statusBadge}
                      <button className="btn btn-ghost btn-icon btn-sm"><Icon name="edit" size={13} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--fg-3)' }}><Icon name="trash" size={13} /></button>
                    </div>
                  );
                })}
              </div>

              {/* Add slot */}
              <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginTop: 8, width: '100%', borderRadius: 8, border: '1.5px dashed var(--border-2)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--fg-2)' }}>
                <Icon name="plus" size={14} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Tambah artikel ke series</span>
                <span style={{ flex: 1 }}></span>
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Bisa dari draft atau yang sudah terbit</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

window.DashboardSeries = DashboardSeries;
