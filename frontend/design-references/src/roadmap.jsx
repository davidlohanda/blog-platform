/* Roadmap Page — visual learning path (reader-facing) */

const ROADMAP = {
  title: "Roadmap Pembaca",
  subtitle: "Tiga tahap untuk memulai kebiasaan membaca yang berbeda. Tidak ada deadline, hanya urutan yang masuk akal.",
  stages: [
    {
      id: 'pemula',
      label: 'Pemula',
      title: 'Memahami kenapa cara membaca kita berubah',
      desc: 'Tiga esai pendek untuk membuka pintu — kenapa attention kita rapuh, dan apa yang dirampas oleh feed.',
      status: 'completed',
      duration: '22 menit',
      count: 3,
      items: [
        { type: 'article', title: 'Membaca Pelan adalah Bentuk Perlawanan', mins: 9, done: true },
        { type: 'article', title: 'Kita Selalu Sibuk, Tapi Jarang Benar-benar Bekerja', mins: 7, done: true },
        { type: 'article', title: 'Apakah Selera Kita Masih Milik Kita?', mins: 6, done: true },
      ],
    },
    {
      id: 'menengah',
      label: 'Menengah',
      title: 'Membangun ulang kebiasaan, satu praktik per minggu',
      desc: 'Series tujuh-minggu yang menggabungkan teori, latihan kecil, dan refleksi mingguan.',
      status: 'in-progress',
      duration: '48 menit',
      count: 6,
      progress: 33,
      items: [
        { type: 'article', title: 'Buku Bukan Konten — dan Kita Bukan Audiens', mins: 7, done: true },
        { type: 'article', title: 'Pensil di Tangan: Praktik Marginalia yang Hilang', mins: 8, done: false, current: true },
        { type: 'article', title: 'Tiga Puluh Menit, Tanpa Layar', mins: 6, done: false },
        { type: 'series', title: 'Series · Mengganti Scroll dengan Bacaan', mins: 32, count: 4, done: false },
      ],
    },
    {
      id: 'lanjut',
      label: 'Lanjut',
      title: 'Membaca sebagai cara berpikir',
      desc: 'Untuk yang sudah konsisten — esai panjang tentang membaca sebagai latihan etis dan intelektual.',
      status: 'locked',
      duration: '65 menit',
      count: 5,
      lockedReason: 'Selesaikan tahap Menengah untuk membuka.',
      items: [],
    },
  ],
};

function StageNode({ stage, expanded, onClick }) {
  const colors = {
    completed:   { ring: 'var(--success)',   bg: 'var(--success)',     fg: '#fff',           icon: 'check' },
    'in-progress': { ring: 'var(--accent)',  bg: 'var(--accent)',      fg: '#fff',           icon: 'play' },
    locked:      { ring: 'var(--border-2)',  bg: 'var(--surface)',     fg: 'var(--fg-3)',    icon: 'lock' },
  };
  const c = colors[stage.status];

  return (
    <button onClick={onClick} disabled={stage.status === 'locked' && false}
      style={{
        textAlign: 'left',
        padding: '24px 26px',
        background: expanded ? 'var(--bg-elev)' : (stage.status === 'locked' ? 'var(--surface)' : 'var(--bg-elev)'),
        border: expanded ? '2px solid var(--fg)' : (stage.status === 'in-progress' ? '1px solid var(--accent)' : '1px solid var(--border)'),
        borderRadius: 14,
        width: '100%',
        cursor: stage.status === 'locked' ? 'default' : 'pointer',
        opacity: stage.status === 'locked' ? .75 : 1,
        fontFamily: 'inherit',
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        position: 'relative',
        transition: 'all .15s',
      }}>
      {/* Step circle */}
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: stage.status === 'in-progress' ? '0 0 0 4px oklch(0.92 0.05 70)' : 'none' }}>
          <Icon name={c.icon} size={22} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Tahap · {stage.label}</span>
          {stage.status === 'completed' && <span className="badge badge-success">Selesai</span>}
          {stage.status === 'in-progress' && <span className="badge badge-accent">Sedang dijalani</span>}
          {stage.status === 'locked' && <span className="badge badge-soft"><Icon name="lock" size={10} /> Terkunci</span>}
        </div>
        <div className="serif-title" style={{ fontSize: 22, marginBottom: 8, color: stage.status === 'locked' ? 'var(--fg-2)' : 'var(--fg)' }}>{stage.title}</div>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 14px', maxWidth: 500 }}>{stage.desc}</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--fg-3)' }}>
          <span><Icon name="file" size={12} /> {stage.count} item</span>
          <span><Icon name="clock" size={12} /> {stage.duration}</span>
          {stage.progress !== undefined && (
            <span style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>{stage.progress}% selesai</span>
          )}
        </div>
        {stage.lockedReason && (
          <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 10, fontStyle: 'italic' }}>{stage.lockedReason}</div>
        )}
        {stage.progress !== undefined && (
          <div style={{ marginTop: 12, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stage.progress}%`, background: 'var(--accent)' }}></div>
          </div>
        )}
      </div>

      {/* Chevron */}
      {stage.status !== 'locked' && (
        <div style={{ flexShrink: 0, color: 'var(--fg-3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s', marginTop: 12 }}>
          <Icon name="chevron" size={18} />
        </div>
      )}
    </button>
  );
}

function StageItem({ item }) {
  return (
    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 10, background: item.current ? 'var(--accent-soft)' : 'transparent', textDecoration: 'none', color: 'inherit', border: '1px solid', borderColor: item.current ? 'oklch(0.85 0.07 70)' : 'var(--border)' }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: item.done ? 'var(--success)' : (item.current ? 'var(--accent)' : 'var(--bg)'), border: item.done || item.current ? 'none' : '1.5px solid var(--border-2)', color: item.done || item.current ? '#fff' : 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {item.done ? <Icon name="check" size={14} /> : item.current ? <Icon name="play" size={11} /> : <Icon name={item.type === 'series' ? 'list' : 'file'} size={13} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
          {item.type === 'series' ? `Series · ${item.count} bagian` : 'Artikel'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--serif)' }}>{item.title}</div>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{item.mins} mnt</div>
      {item.current && <button className="btn btn-accent btn-sm">Lanjutkan</button>}
    </a>
  );
}

function RoadmapPage() {
  const [expanded, setExpanded] = React.useState('menengah');
  const totalDone = 4, totalItems = 14;
  const pct = Math.round((totalDone / totalItems) * 100);

  return (
    <div className="pub-page scroll-y">
      <TopBar active="roadmap" isMember />

      {/* Hero */}
      <section style={{ padding: '56px 32px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>Roadmap pembaca</div>
          <h1 className="serif-title" style={{ fontSize: 44, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>{ROADMAP.title}</h1>
          <p style={{ fontSize: 18, color: 'var(--fg-2)', lineHeight: 1.6, fontFamily: 'var(--serif)', margin: '0 0 28px', maxWidth: 620 }}>{ROADMAP.subtitle}</p>

          {/* Overall progress */}
          <div className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Progress kamu</div>
                <div style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>
                  <strong style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--fg)' }}>{totalDone}</strong> dari {totalItems} item
                </div>
              </div>
              <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)' }}></div>
              </div>
            </div>
            <button className="btn btn-primary">Lanjutkan dari titik terakhir <Icon name="arrow" /></button>
          </div>
        </div>
      </section>

      {/* Stages */}
      <section style={{ padding: '48px 32px 80px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative' }}>
          {/* Vertical connector line behind */}
          <div style={{ position: 'absolute', left: 49, top: 80, bottom: 80, width: 2, background: 'var(--border)', zIndex: 0 }}></div>

          <div style={{ display: 'grid', gap: 16, position: 'relative' }}>
            {ROADMAP.stages.map((stage, i) => (
              <React.Fragment key={stage.id}>
                <StageNode stage={stage} expanded={expanded === stage.id} onClick={() => stage.status !== 'locked' && setExpanded(expanded === stage.id ? null : stage.id)} />
                {expanded === stage.id && stage.items.length > 0 && (
                  <div style={{ paddingLeft: 76, paddingRight: 16, paddingTop: 4, paddingBottom: 16, display: 'grid', gap: 8 }}>
                    {stage.items.map((item, j) => <StageItem key={j} item={item} />)}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Completion card */}
          <div style={{ marginTop: 36, padding: '28px 32px', background: 'var(--fg)', color: 'var(--bg)', borderRadius: 14, textAlign: 'center' }}>
            <Icon name="check" size={28} color="var(--accent)" />
            <h3 className="serif-title" style={{ fontSize: 24, margin: '12px 0 8px', color: 'var(--bg)' }}>Sertifikat baca</h3>
            <p style={{ fontSize: 14, opacity: .75, lineHeight: 1.6, margin: '0 auto 18px', maxWidth: 460 }}>
              Setelah ketiga tahap selesai, kamu akan menerima sertifikat digital sederhana yang bisa kamu simpan atau bagikan. Bukan untuk pamer — sebagai pengingat.
            </p>
            <span style={{ fontSize: 12, color: 'var(--bg)', opacity: .55 }}>Terbuka untuk member Lentera</span>
          </div>
        </div>
      </section>

      <PubFooter />
    </div>
  );
}

window.RoadmapPage = RoadmapPage;
