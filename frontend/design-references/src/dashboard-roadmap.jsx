/* Dashboard — Roadmap Management */

const ROADMAP_EDIT = {
  title: 'Roadmap Pembaca',
  subtitle: 'Tiga tahap untuk membangun ulang kebiasaan membaca, dari pemula sampai lanjut.',
  stages: [
    {
      id: 'pemula', label: 'Pemula', status: 'published', count: 3,
      title: 'Memahami kenapa cara membaca kita berubah',
      items: [
        { type: 'article', title: 'Membaca Pelan adalah Bentuk Perlawanan' },
        { type: 'article', title: 'Kita Selalu Sibuk, Tapi Jarang Benar-benar Bekerja' },
        { type: 'article', title: 'Apakah Selera Kita Masih Milik Kita?' },
      ],
    },
    {
      id: 'menengah', label: 'Menengah', status: 'published', count: 4,
      title: 'Membangun ulang kebiasaan, satu praktik per minggu',
      items: [
        { type: 'article', title: 'Buku Bukan Konten — dan Kita Bukan Audiens' },
        { type: 'article', title: 'Pensil di Tangan: Praktik Marginalia yang Hilang' },
        { type: 'article', title: 'Tiga Puluh Menit, Tanpa Layar' },
        { type: 'series',  title: 'Series · Mengganti Scroll dengan Bacaan', count: 4 },
      ],
    },
    {
      id: 'lanjut', label: 'Lanjut', status: 'draft', count: 5,
      title: 'Membaca sebagai cara berpikir',
      items: [
        { type: 'article', title: 'Marginalia dan Etika Membaca' },
        { type: 'article', title: 'Apa yang Tidak Bisa Diringkas' },
        { type: 'article', title: 'Membaca Bareng: Pengalaman Tujuh Tahun Klub Buku' },
        { type: 'series',  title: 'Series · Esai-esai tentang Perhatian', count: 5 },
        { type: 'article', title: 'Penutup: Setelah Halaman Terakhir' },
      ],
    },
  ],
};

function StageEditor({ stage, idx, isFirst, isLast }) {
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Vertical connector + step indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: stage.status === 'published' ? 'var(--fg)' : 'var(--surface-2)', color: stage.status === 'published' ? 'var(--bg)' : 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 18 }}>
          {idx + 1}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 50, background: 'var(--border)', marginTop: 6 }}></div>}
      </div>

      {/* Stage card */}
      <div className="card" style={{ flex: 1, padding: 0, marginBottom: isLast ? 0 : 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ color: 'var(--fg-4)', cursor: 'grab' }}>⋮⋮</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input className="input" defaultValue={stage.label} style={{ width: 140, height: 32, fontSize: 13, fontWeight: 600, padding: '0 10px' }} />
            <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>·</span>
            <input className="input" defaultValue={stage.title} style={{ flex: 1, height: 32, fontSize: 13.5, padding: '0 10px' }} />
          </div>
          {stage.status === 'published'
            ? <span className="badge badge-success badge-dot">Terbit</span>
            : <span className="badge badge-soft">Draft</span>}
          <button className="btn btn-ghost btn-icon btn-sm"><Icon name="settings" size={13} /></button>
          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--fg-3)' }}><Icon name="trash" size={13} /></button>
        </div>

        <div style={{ padding: '12px 22px 18px' }}>
          <div style={{ display: 'grid', gap: 6 }}>
            {stage.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--fg-4)', cursor: 'grab', fontSize: 13 }}>⋮⋮</span>
                <span className="badge badge-soft" style={{ height: 20, fontSize: 10.5, letterSpacing: '0.06em' }}>
                  <Icon name={it.type === 'series' ? 'list' : 'file'} size={10} /> {it.type === 'series' ? 'SERIES' : 'ARTIKEL'}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontFamily: 'var(--serif)' }}>{it.title}</span>
                {it.count && <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{it.count} bagian</span>}
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--fg-3)' }}><Icon name="trash" size={12} /></button>
              </div>
            ))}
            <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1.5px dashed var(--border-2)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--fg-3)', fontSize: 13 }}>
              <Icon name="plus" size={13} />
              <span>Tambah artikel atau series</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardRoadmap() {
  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="roadmap" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Roadmap"
          subtitle="Atur learning path bertahap untuk pembaca kamu."
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline"><Icon name="eye" size={14} /> Preview</button>
              <button className="btn btn-primary">Terbitkan perubahan</button>
            </div>
          }
        />
        <div style={{ padding: 36, flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'flex-start' }}>
          {/* Left — roadmap meta */}
          <aside style={{ position: 'sticky', top: 0 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Roadmap aktif</div>
              <div className="serif-title" style={{ fontSize: 18, marginBottom: 10 }}>{ROADMAP_EDIT.title}</div>
              <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 14px' }}>{ROADMAP_EDIT.subtitle}</p>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--fg-3)' }}>Tahap</span>
                  <strong>{ROADMAP_EDIT.stages.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--fg-3)' }}>Total item</span>
                  <strong>{ROADMAP_EDIT.stages.reduce((s, x) => s + x.count, 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--fg-3)' }}>Pembaca aktif</span>
                  <strong>1.842</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--fg-3)' }}>Completion rate</span>
                  <strong>14%</strong>
                </div>
              </div>
              <hr className="divider" style={{ margin: '14px 0' }} />
              <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>Ubah info & cover</button>
            </div>

            <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--surface)', borderRadius: 10, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--fg)' }}>Tip:</strong> tahap berikutnya otomatis ter-unlock saat pembaca menyelesaikan minimal 80% item di tahap sebelumnya.
            </div>

            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, width: '100%', color: 'var(--fg-3)' }}>Lihat semua roadmap (2)</button>
          </aside>

          {/* Right — stage editor */}
          <main>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div className="serif-title" style={{ fontSize: 20 }}>Tahap dalam roadmap</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-outline btn-sm">Susun ulang</button>
                <button className="btn btn-primary btn-sm"><Icon name="plus" size={13} /> Tambah tahap</button>
              </div>
            </div>

            {ROADMAP_EDIT.stages.map((stage, i) => (
              <StageEditor key={stage.id} stage={stage} idx={i} isFirst={i === 0} isLast={i === ROADMAP_EDIT.stages.length - 1} />
            ))}

            {/* Add stage CTA */}
            <div style={{ marginLeft: 64 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', width: '100%', borderRadius: 12, border: '1.5px dashed var(--border-2)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--fg-2)' }}>
                <Icon name="plus" size={16} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Tambah tahap baru</span>
                <span style={{ flex: 1 }}></span>
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Misal: Mahir, Praktisi, atau apapun yang masuk akal</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

window.DashboardRoadmap = DashboardRoadmap;
