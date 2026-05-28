/* Shared UI primitives + sample data for Investasi Cerdas designs */

const PUB = {
  name: "Lentera",
  tagline: "Tulisan-tulisan pelan untuk masa yang terburu-buru. Esai mingguan tentang ide, buku, dan cara berpikir.",
  domain: "lentera.id",
  subscribers: 8420,
  articles: 142,
};

const AUTHORS = [
  { id: "anya",   name: "Anya Permata",  initials: "AP", role: "Esai & Sastra",      bio: "Penulis dan pembaca rakus. Menulis tentang buku, bahasa, dan apa-apa yang nyangkut di kepala setelah lampu kamar dimatikan." },
  { id: "rangga", name: "Rangga Saputra", initials: "RS", role: "Teknologi & Budaya", bio: "Mengamati bagaimana teknologi mengubah kebiasaan kita — kadang tanpa kita sadari. Mantan engineer, sekarang lebih banyak menulis daripada nge-code." },
  { id: "mira",   name: "Mira Anjani",   initials: "MA", role: "Filsafat Sehari-hari", bio: "Tertarik pada hal-hal kecil: ritual pagi, percakapan basa-basi, kebiasaan yang kita ulangi tanpa pernah benar-benar memikirkannya." },
];

const ARTICLES = [
  {
    id: "membaca-pelan",
    title: "Membaca Pelan adalah Bentuk Perlawanan",
    excerpt: "Di tengah feed yang tak pernah selesai, menghabiskan satu jam untuk satu bab terasa seperti tindakan radikal. Mungkin memang itu.",
    author: AUTHORS[0],
    date: "18 Mei 2026",
    readTime: 9,
    tag: "Esai",
    premium: false,
    image: "books on table",
  },
  {
    id: "sibuk-tapi-kosong",
    title: "Kita Selalu Sibuk, Tapi Jarang Benar-benar Bekerja",
    excerpt: "Notifikasi, rapat singkat, balasan cepat. Hari berlalu produktif di permukaan, tapi tak satu pun pekerjaan yang penting selesai. Apa yang sebenarnya terjadi?",
    author: AUTHORS[1],
    date: "14 Mei 2026",
    readTime: 12,
    tag: "Kebiasaan",
    premium: true,
    image: "empty desk morning",
  },
  {
    id: "basa-basi",
    title: "Pembelaan Singkat untuk Basa-basi",
    excerpt: "“Sudah makan?”, “Lagi di mana?” — pertanyaan yang sering kita anggap kosong sebenarnya menanggung lebih banyak makna daripada yang kita kira.",
    author: AUTHORS[2],
    date: "11 Mei 2026",
    readTime: 6,
    tag: "Filsafat",
    premium: false,
    image: "two coffee cups",
  },
  {
    id: "menulis-tangan",
    title: "Catatan untuk Diri Sendiri: Mengapa Saya Kembali Menulis Tangan",
    excerpt: "Bukan karena romantis. Bukan karena anti-teknologi. Saya cuma menyadari bahwa beberapa pikiran tidak mau muncul lewat keyboard.",
    author: AUTHORS[0],
    date: "7 Mei 2026",
    readTime: 7,
    tag: "Kebiasaan",
    premium: true,
    image: "notebook and pen",
  },
  {
    id: "algoritma-selera",
    title: "Apakah Selera Kita Masih Milik Kita?",
    excerpt: "Lagu yang kamu suka, film yang kamu rekomendasikan, buku yang kamu baca — sebagian besar muncul di hadapanmu karena seseorang (atau sesuatu) memutuskan demikian.",
    author: AUTHORS[1],
    date: "3 Mei 2026",
    readTime: 11,
    tag: "Teknologi",
    premium: true,
    image: "playlist screen",
  },
  {
    id: "ritual-pagi",
    title: "Ritual Pagi Itu Tidak Harus Produktif",
    excerpt: "Kita terlalu cepat mengubah pagi menjadi proyek. Padahal ada nilai dalam pagi-pagi yang tidak melakukan apa-apa.",
    author: AUTHORS[2],
    date: "28 April 2026",
    readTime: 5,
    tag: "Esai",
    premium: false,
    image: "morning window light",
  },
];

/* ───── Atoms ───── */

const Avatar = ({ author, size = "" }) => {
  const cls = size === "sm" ? "avatar avatar-sm" : size === "lg" ? "avatar avatar-lg" : size === "xl" ? "avatar avatar-xl" : "avatar";
  // assign a stable hue per author
  const hues = { dimas: 30, sari: 200, adi: 130 };
  const h = hues[author.id] ?? 60;
  return (
    <span className={cls} style={{ background: `oklch(0.88 0.06 ${h})`, color: `oklch(0.32 0.1 ${h})` }}>
      {author.initials}
    </span>
  );
};

const Tag = ({ children, variant = "soft" }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

const PremiumBadge = () => (
  <span className="badge badge-accent" style={{ fontSize: 10.5, height: 20, paddingRight: 9 }}>
    <Icon name="lock" size={10} /> PREMIUM
  </span>
);

/* Inline SVG icons — minimal stroke set */
const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 1.6 }) => {
  const paths = {
    lock:       <><rect x="4" y="9" width="12" height="9" rx="1.5"/><path d="M7 9V6a3 3 0 0 1 6 0v3"/></>,
    heart:      <path d="M10 16.5s-6-3.5-6-8a3.5 3.5 0 0 1 6-2.4 3.5 3.5 0 0 1 6 2.4c0 4.5-6 8-6 8z"/>,
    bookmark:   <path d="M5 3h10v15l-5-3-5 3V3z"/>,
    comment:    <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3v-3a2 2 0 0 1-1-1V5z"/>,
    share:      <><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M7 9l6-3M7 11l6 3"/></>,
    arrow:      <path d="M4 10h12m-4-4l4 4-4 4"/>,
    arrowLeft:  <path d="M16 10H4m4-4l-4 4 4 4"/>,
    check:      <path d="M4 10l4 4 8-8"/>,
    plus:       <path d="M10 4v12M4 10h12"/>,
    search:     <><circle cx="9" cy="9" r="5"/><path d="M13 13l3 3"/></>,
    chevron:    <path d="M7 5l5 5-5 5"/>,
    chevronDown:<path d="M5 8l5 5 5-5"/>,
    moon:       <path d="M16 12a6 6 0 1 1-7-7 5 5 0 0 0 7 7z"/>,
    sun:        <><circle cx="10" cy="10" r="3.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></>,
    eye:        <><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="2.5"/></>,
    folder:     <path d="M3 6a2 2 0 0 1 2-2h3l2 2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/>,
    clock:      <><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></>,
    play:       <path d="M6 4l10 6-10 6V4z" fill="currentColor"/>,
    edit:       <path d="M3 17l4-1 10-10-3-3L4 13l-1 4z"/>,
    settings:   <><circle cx="10" cy="10" r="2.5"/><path d="M10 1l1.5 2.5L14 3l.5 2.5L17 7l-1 2.5L17 13l-2.5 1L14 17l-2.5-.5L10 19l-1.5-2.5L6 17l-.5-2.5L3 13l1-2.5L3 7l2.5-1L6 3l2.5.5L10 1z"/></>,
    grid:       <><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></>,
    list:       <><path d="M6 5h11M6 10h11M6 15h11"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="10" r="1"/><circle cx="3" cy="15" r="1"/></>,
    user:       <><circle cx="10" cy="7" r="3.5"/><path d="M3 17c1-3 4-5 7-5s6 2 7 5"/></>,
    users:      <><circle cx="7" cy="7" r="3"/><circle cx="14" cy="8" r="2.5"/><path d="M2 16c.5-2.5 2.5-4 5-4s4.5 1.5 5 4M13 16c0-2 1.5-3.5 3.5-3.5"/></>,
    chart:      <path d="M3 15l4-5 3 3 7-8M14 5h3v3"/>,
    dollar:     <><path d="M10 2v16"/><path d="M14 6c-1-1-2.5-1.5-4-1.5-2 0-3.5 1-3.5 2.5s1 2 3 2.5l1 .2c2 .5 3 1.2 3 2.7 0 1.7-1.5 2.6-3.5 2.6-1.7 0-3.3-.7-4-1.8"/></>,
    file:       <path d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>,
    image:      <><rect x="3" y="3" width="14" height="14" rx="1.5"/><circle cx="7.5" cy="7.5" r="1.5"/><path d="M3 13l4-4 4 4 3-3 3 3"/></>,
    bold:       <path d="M6 4h5a3 3 0 0 1 0 6H6V4zM6 10h6a3 3 0 0 1 0 6H6v-6z" fill="currentColor"/>,
    italic:     <path d="M9 4h6M5 16h6M12 4l-4 12"/>,
    quote:      <path d="M5 9c0-2 1-3.5 3-4.5M5 9v5h4V9H5zM12 9c0-2 1-3.5 3-4.5M12 9v5h4V9h-4z"/>,
    h1:         <><path d="M3 4v12M11 4v12M3 10h8"/><path d="M14 7l2-1v10"/></>,
    h2:         <><path d="M3 4v12M11 4v12M3 10h8"/><path d="M14 7c0-1 1-2 2-2s2 1 2 2c0 2-4 4-4 7h4"/></>,
    link:       <><path d="M8 12a3 3 0 0 0 4 0l3-3a3 3 0 0 0-4-4l-1 1"/><path d="M12 8a3 3 0 0 0-4 0l-3 3a3 3 0 0 0 4 4l1-1"/></>,
    trash:      <path d="M4 6h12M8 6V4h4v2M6 6l1 10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l1-10"/>,
    menu:       <path d="M3 6h14M3 10h14M3 14h14"/>,
    download:   <><path d="M10 3v10m-4-4l4 4 4-4"/><path d="M3 16h14"/></>,
    filter:     <path d="M3 5h14l-5 6v5l-4-2v-3L3 5z"/>,
    google:     <><path fill="#4285F4" d="M17.5 10.2c0-.6-.05-1.1-.15-1.7H10v3.2h4.2c-.2 1-.7 1.85-1.6 2.4v2h2.6c1.5-1.4 2.3-3.4 2.3-5.9z"/><path fill="#34A853" d="M10 18c2.2 0 4-.7 5.3-2l-2.6-2c-.7.5-1.6.8-2.7.8-2.1 0-3.9-1.4-4.5-3.3H2.8v2.1A8 8 0 0 0 10 18z"/><path fill="#FBBC04" d="M5.5 11.5c-.15-.5-.25-1-.25-1.5s.1-1 .25-1.5V6.4H2.8A8 8 0 0 0 2 10c0 1.3.3 2.5.8 3.6l2.7-2.1z"/><path fill="#EA4335" d="M10 4.7c1.2 0 2.3.4 3.1 1.2l2.3-2.3A8 8 0 0 0 10 2a8 8 0 0 0-7.2 4.4l2.7 2.1C6.1 6.1 7.9 4.7 10 4.7z"/></>,
  };
  const isGoogle = name === "google";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20"
      fill={isGoogle ? undefined : "none"}
      stroke={isGoogle ? "none" : color}
      strokeWidth={isGoogle ? 0 : strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'text-bottom' }}>
      {paths[name]}
    </svg>
  );
};

const Logo = () => (
  <a href="#" className="pub-brand">
    <span className="pub-brand-mark">L</span>
    <span>Lentera</span>
  </a>
);

const TopBar = ({ active = "home", isMember = false, showCta = true }) => (
  <div className="pub-topbar">
    <Logo />
    <nav className="pub-nav">
      <a href="#" className={active === "home" ? "active" : ""}>Beranda</a>
      <a href="#" className={active === "series" ? "active" : ""}>Series</a>
      <a href="#" className={active === "roadmap" ? "active" : ""}>Roadmap</a>
      <a href="#" className={active === "qa" ? "active" : ""}>Q&amp;A</a>
      <a href="#" className={active === "authors" ? "active" : ""}>Penulis</a>
      <a href="#" className={active === "about" ? "active" : ""}>Tentang</a>
    </nav>
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button className="btn btn-ghost btn-icon btn-sm" title="Cari"><Icon name="search" /></button>
      {isMember ? (
        <>
          <button className="btn btn-ghost btn-sm" style={{ gap: 6 }}><Icon name="bookmark" /> Library</button>
          <Avatar size="sm" author={{ id: "rina", initials: "RA" }} />
        </>
      ) : showCta ? (
        <>
          <a href="#" className="btn btn-ghost btn-sm">Masuk</a>
          <a href="#" className="btn btn-accent btn-sm">Berlangganan</a>
        </>
      ) : null}
    </div>
  </div>
);

const ArticleCard = ({ article, compact = false, featured = false }) => {
  if (featured) {
    return (
      <a href="#" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 36, textDecoration: 'none', color: 'inherit', alignItems: 'center' }}>
        <div className="placeholder-img" style={{ height: 320 }} data-caption={`hero · ${article.image}`}></div>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <Tag>{article.tag}</Tag>
            {article.premium && <PremiumBadge />}
          </div>
          <h2 className="serif-title" style={{ fontSize: 36, margin: '0 0 14px' }}>{article.title}</h2>
          <p style={{ fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 18px' }}>{article.excerpt}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--fg-3)' }}>
            <Avatar size="sm" author={article.author} />
            <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{article.author.name}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime} mnt baca</span>
          </div>
        </div>
      </a>
    );
  }
  return (
    <a href="#" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="placeholder-img" style={{ height: compact ? 140 : 180, marginBottom: 14 }} data-caption={article.image}></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Tag>{article.tag}</Tag>
        {article.premium && <PremiumBadge />}
      </div>
      <h3 className="serif-title" style={{ fontSize: compact ? 18 : 22, margin: '0 0 8px', lineHeight: 1.25 }}>{article.title}</h3>
      <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-3)' }}>
        <Avatar size="sm" author={article.author} />
        <span style={{ color: 'var(--fg-2)' }}>{article.author.name}</span>
        <span>·</span>
        <span>{article.readTime} mnt</span>
      </div>
    </a>
  );
};

const PubFooter = () => (
  <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 32px 32px', marginTop: 60, color: 'var(--fg-3)', fontSize: 13 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        <Logo />
        <p style={{ maxWidth: 360, marginTop: 14, lineHeight: 1.6 }}>{PUB.tagline}</p>
      </div>
      <div style={{ display: 'flex', gap: 48 }}>
        <div>
          <div style={{ color: 'var(--fg-2)', fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Konten</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Artikel terbaru</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Series</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Roadmap</a>
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--fg-2)', fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Lainnya</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Tentang penulis</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Kontak</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Kebijakan privasi</a>
          </div>
        </div>
      </div>
    </div>
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
      <span>© 2026 Investasi Cerdas. Konten edukasi, bukan saran investasi.</span>
      <span>{PUB.domain}</span>
    </div>
  </footer>
);

Object.assign(window, { PUB, AUTHORS, ARTICLES, Avatar, Tag, PremiumBadge, Icon, Logo, TopBar, ArticleCard, PubFooter });
