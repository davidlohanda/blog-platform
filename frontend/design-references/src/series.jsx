/* Series Page — reader-facing */

const SERIES = {
  title: "Belajar Membaca Pelan",
  subtitle: "Enam esai pendek tentang membaca, perhatian, dan apa yang kita lupakan saat kita hanya scrolling.",
  author: AUTHORS[0],
  totalArticles: 6,
  totalReadTime: 48,
  description: "Series ini lahir dari pertanyaan sederhana: kenapa saya tidak lagi bisa menikmati membaca seperti dulu? Enam minggu, enam tulisan, satu kebiasaan yang kita coba pulihkan bersama.",
};

const SERIES_ITEMS = [
  { num: 1, title: "Membaca Pelan adalah Bentuk Perlawanan", excerpt: "Mengapa kebiasaan membaca telah berubah, dan kenapa itu penting.", readTime: 9, state: 'completed' },
  { num: 2, title: "Buku Bukan Konten — dan Kita Bukan Audiens", excerpt: "Apa bedanya membaca buku dengan mengonsumsi feed? Ternyata lebih banyak dari yang kita kira.", readTime: 7, state: 'completed' },
  { num: 3, title: "Pensil di Tangan: Praktik Marginalia yang Hilang", excerpt: "Catatan kecil di pinggir halaman adalah percakapan. Mari belajar memulainya lagi.", readTime: 8, state: 'in-progress', progress: 40 },
  { num: 4, title: "Tiga Puluh Menit, Tanpa Layar", excerpt: "Eksperimen sederhana yang mengubah cara saya melihat waktu luang.", readTime: 6, state: 'unread' },
  { num: 5, title: "Berhenti Tanpa Bersalah", excerpt: "Buku yang tidak selesai bukanlah kegagalan — itu informasi.", readTime: 8, state: 'unread', premium: true },
  { num: 6, title: "Kembali ke Dunia Setelah Membaca Lama", excerpt: "Cara menutup buku yang baik, dan apa yang kita bawa keluar dari halaman terakhir.", readTime: 10, state: 'unread', premium: true },
];

function ProgressRing({ pct, size = 36 }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--border)" strokeWidth="3" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth="3" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct/100)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

function SeriesItem({ item, isLast }) {
  const stateColors = {
    'completed':   { dot: 'var(--success)', text: 'var(--fg-3)' },
    'in-progress': { dot: 'var(--accent)',  text: 'var(--fg)' },
    'unread':      { dot: 'var(--border-2)', text: 'var(--fg)' },
  };
  const sc = stateColors[item.state];

  return (
    <div style={{ display: 'flex', gap: 24, position: 'relative' }}>
      {/* Step indicator + connecting line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
        <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
          {item.state === 'in-progress' ? (
            <>
              <ProgressRing pct={item.progress} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--accent-ink)' }}>{item.progress}%</div>
            </>
          ) : item.state === 'completed' ? (
            <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Icon name="check" size={16} />
            </div>
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--bg)', border: '1.5px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>
              {item.num}
            </div>
          )}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, background: item.state === 'completed' ? 'var(--success)' : 'var(--border)', minHeight: 32, marginTop: 4 }}></div>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 36 }}>
        <a href="#" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bagian {item.num}</span>
            {item.state === 'completed' && <span className="badge badge-success" style={{ height: 18, fontSize: 10.5 }}>Selesai</span>}
            {item.state === 'in-progress' && <span className="badge badge-accent" style={{ height: 18, fontSize: 10.5 }}>Sedang dibaca</span>}
            {item.premium && <PremiumBadge />}
          </div>
          <h3 className="serif-title" style={{ fontSize: 24, margin: '0 0 8px', color: sc.text }}>{item.title}</h3>
          <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 12px', maxWidth: 580 }}>{item.excerpt}</p>
          <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--fg-3)' }}>
            <span><Icon name="clock" size={12} /> {item.readTime} mnt</span>
            {item.state === 'completed' && <span>· Dibaca 3 hari lalu</span>}
            {item.state === 'unread' && !item.premium && <span>· Belum dibaca</span>}
            {item.state === 'unread' && item.premium && <span>· Khusus member</span>}
          </div>
        </a>
      </div>
    </div>
  );
}

function SeriesPage() {
  const completed = SERIES_ITEMS.filter(i => i.state === 'completed').length;
  const totalProgress = (completed / SERIES_ITEMS.length) * 100;
  return (
    <div className="pub-page scroll-y">
      <TopBar active="series" isMember />

      {/* Series hero */}
      <section style={{ padding: '56px 32px 40px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none', marginBottom: 18 }}>
            <Icon name="arrowLeft" size={13} /> Semua series
          </a>
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <div className="placeholder-img" style={{ width: 200, height: 260, flexShrink: 0 }} data-caption="cover series"></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>Series · 6 bagian</div>
              <h1 className="serif-title" style={{ fontSize: 44, margin: '0 0 14px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>{SERIES.title}</h1>
              <p style={{ fontSize: 17, color: 'var(--fg-2)', lineHeight: 1.55, fontFamily: 'var(--serif)', margin: '0 0 22px' }}>{SERIES.subtitle}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <Avatar author={SERIES.author} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{SERIES.author.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{SERIES.totalArticles} tulisan · total {SERIES.totalReadTime} menit baca</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: 'var(--bg-elev)', borderRadius: 10, padding: '14px 18px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Progress kamu</div>
                    <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--serif)' }}>{completed} dari {SERIES_ITEMS.length} bagian</div>
                  </div>
                  <button className="btn btn-primary btn-sm">Lanjutkan baca <Icon name="arrow" size={13} /></button>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalProgress + 6}%`, background: 'var(--accent)', borderRadius: 3 }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section style={{ padding: '48px 32px 8px', maxWidth: 880, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 40 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tentang series</div>
          <p style={{ fontSize: 17, fontFamily: 'var(--serif)', lineHeight: 1.7, color: 'var(--fg-2)', margin: 0 }}>{SERIES.description}</p>
        </div>
      </section>

      {/* Items list */}
      <section style={{ padding: '48px 32px 80px', maxWidth: 880, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 40 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: 8 }}>Daftar bagian</div>
          <div>
            {SERIES_ITEMS.map((item, i) => (
              <SeriesItem key={item.num} item={item} isLast={i === SERIES_ITEMS.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <PubFooter />
    </div>
  );
}

window.SeriesPage = SeriesPage;
