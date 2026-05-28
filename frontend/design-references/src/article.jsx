/* Article page — shared body component
   Variants: 'free' | 'paywall' | 'member' */

const ARTICLE = {
  tag: "Esai",
  title: "Membaca Pelan adalah Bentuk Perlawanan",
  subtitle: "Di tengah feed yang tak pernah selesai, menghabiskan satu jam untuk satu bab terasa seperti tindakan radikal. Mungkin memang itu.",
  author: AUTHORS[0],
  date: "18 Mei 2026",
  readTime: 9,
  premium: true,
};

const ARTICLE_BODY_FULL = [
  { type: 'p', html: `Setiap pagi sebelum saya membuka laptop, ada ritual kecil yang saya jaga: lima belas menit dengan satu buku, di kursi yang sama, kopi yang masih terlalu panas untuk diminum. Tidak banyak, tapi cukup. Cukup untuk mengingatkan bahwa <strong>hari ini saya tidak harus mengejar apa-apa</strong>.` },
  { type: 'p', html: `Saya tidak selalu seperti ini. Selama bertahun-tahun, membaca buku saya perlakukan seperti pekerjaan yang harus diselesaikan. Saya menghitung halaman. Saya membandingkan kecepatan baca dengan teman-teman di Goodreads. Buku menjadi item yang harus di-<em>check off</em>, bukan dunia yang harus dimasuki.` },
  { type: 'h2', html: `Kapan Buku Berubah Jadi Konten` },
  { type: 'p', html: `Ada satu momen — saya tidak ingat persis kapan — ketika saya sadar bahwa cara saya membaca telah berubah. Mata saya bergerak terlalu cepat. Saya mendapati diri membalik halaman tanpa benar-benar mengingat baris terakhir. Otak saya, terlatih oleh tahun-tahun scroll, mencari dopamine pendek yang tidak akan diberikan oleh buku bagus.` },
  { type: 'pull', html: `Sebagian besar buku bagus tidak memberi kepuasan instan. Mereka memberi kepuasan yang lambat — yang membutuhkan kesediaan kita untuk menunggu.` },
  { type: 'p', html: `Saya pernah membaca esai Maryanne Wolf tentang “deep reading” dan bagaimana kebiasaan digital mengikis sirkuit otak yang dulu memungkinkan kita membaca panjang. Saat itu saya menganggapnya berlebihan. Sekarang saya kira saya yang naif.` },
  { type: 'h2', html: `Apa yang Hilang Saat Kita Membaca Cepat` },
  { type: 'p', html: `Ketika kita membaca cepat, kita masih menyerap informasi. Tapi informasi bukanlah pemahaman. Dan pemahaman bukanlah perubahan. Tiga hal yang berbeda, dan hanya yang ketiga yang sebenarnya kita cari ketika kita membuka buku yang serius.` },
  { type: 'p', html: `Membaca pelan bukan tentang lambat secara fisik. Beberapa pembaca cepat tetap menyerap dalam. Ini lebih tentang <strong>kesediaan untuk berhenti</strong>: kembali ke paragraf yang aneh, menulis pertanyaan di pinggir halaman, menutup buku selama lima menit untuk memikirkan satu kalimat.` },
  { type: 'p', html: `Itu yang tidak ditawarkan oleh feed manapun. Feed dirancang untuk membuat kita tetap di sana. Buku, paradoksnya, dirancang untuk membuat kita berhenti sejenak.` },
  { type: 'h2', html: `Praktik` },
  { type: 'p', html: `Beberapa hal yang membantu saya kembali ke kebiasaan membaca pelan:` },
  { type: 'ul', items: [
    `<strong>Satu buku dalam satu waktu.</strong> Lupakan TBR pile yang menumpuk. Dia tidak akan ke mana-mana.`,
    `<strong>Pensil di tangan.</strong> Tidak untuk highlight estetik di Instagram. Untuk membuat komentar pendek di margin — argumen kecil dengan penulisnya.`,
    `<strong>Jam, bukan halaman.</strong> Saya menargetkan tiga puluh menit, bukan dua puluh halaman. Beda perasaan, beda hasil.`,
    `<strong>Tidak apa-apa berhenti.</strong> Buku yang tidak menarik untuk Anda hari ini mungkin akan menarik tahun depan. Atau tidak. Keduanya tidak masalah.`,
  ]},
  { type: 'h2', html: `Kembali ke Awal` },
  { type: 'p', html: `Saya menulis ini sambil sesekali melirik ke buku di pinggir meja. Bab tiga, halaman 47. Saya sudah di sana selama tiga hari. Versi saya yang dulu akan panik. Versi saya yang sekarang menganggap itu kemenangan kecil.` },
  { type: 'p', html: `Mungkin itulah yang sebenarnya saya bela ketika saya membela membaca pelan. Bukan kebiasaan literasi, tapi <strong>hak untuk tidak terus-menerus bergerak</strong>. Hak untuk hidup di dalam satu paragraf cukup lama sampai paragraf itu hidup juga di dalam saya.` },
  { type: 'hr' },
  { type: 'p', html: `<em>Anya menulis tentang buku, bahasa, dan ide-ide kecil yang mengintip dari tepi kebiasaan kita. Surat-surat barunya tayang setiap Sabtu pagi.</em>` },
];

const ARTICLE_BODY_PREVIEW = ARTICLE_BODY_FULL.slice(0, 3); // first 3 blocks ~= ~200 kata

function ProseBlocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.type === 'p') return <p key={i} className={i === 0 ? 'lead' : ''} dangerouslySetInnerHTML={{ __html: b.html }} />;
    if (b.type === 'h2') return <h2 key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
    if (b.type === 'pull') return <div key={i} className="pull" dangerouslySetInnerHTML={{ __html: b.html }} />;
    if (b.type === 'ul') return <ul key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}</ul>;
    if (b.type === 'hr') return <hr key={i} />;
    return null;
  });
}

function ActionRail({ liked, setLiked, saved, setSaved, isMember }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '32px 0' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setLiked(!liked)} style={{ color: liked ? 'var(--accent-ink)' : undefined }}>
          <Icon name="heart" color={liked ? 'var(--accent-ink)' : 'currentColor'} /> {liked ? '143' : '142'}
        </button>
        <button className="btn btn-ghost btn-sm">
          <Icon name="comment" /> 18
        </button>
        {isMember && (
          <button className="btn btn-ghost btn-sm" onClick={() => setSaved(!saved)} style={{ color: saved ? 'var(--accent-ink)' : undefined }}>
            <Icon name="bookmark" color={saved ? 'var(--accent-ink)' : 'currentColor'} />
            {saved ? 'Tersimpan' : 'Simpan'}
          </button>
        )}
      </div>
      <button className="btn btn-ghost btn-sm"><Icon name="share" /> Bagikan</button>
    </div>
  );
}

function AuthorCard({ author }) {
  return (
    <div className="card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 24 }}>
      <Avatar size="xl" author={author} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Ditulis oleh</div>
        <h3 className="serif-title" style={{ fontSize: 22, margin: '0 0 4px' }}>{author.name}</h3>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 10 }}>{author.role} · 38 tulisan</div>
        <p style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 14px' }}>{author.bio}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm">Lihat semua tulisan</button>
          <button className="btn btn-ghost btn-sm">Ikuti penulis</button>
        </div>
      </div>
    </div>
  );
}

function RelatedArticles() {
  const items = ARTICLES.filter(a => a.id !== 'membaca-pelan').slice(0, 3);
  return (
    <div style={{ marginTop: 48 }}>
      <h3 className="serif-title" style={{ fontSize: 22, margin: '0 0 20px' }}>Bacaan terkait</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {items.map(a => <ArticleCard key={a.id} article={a} compact />)}
      </div>
    </div>
  );
}

function Comments() {
  const COMMENTS = [
    {
      who: AUTHORS[1],
      ago: "3 jam lalu",
      pinned: true,
      isAuthor: true,
      likes: 28,
      liked: true,
      text: "Resonansi penuh. Saya pernah eksperimen membaca 30 menit tanpa highlighter, tanpa note. Awalnya gelisah karena merasa “tidak produktif”. Setelah seminggu, justru retensi saya lebih bagus — dan saya bisa menceritakan ulang isi buku tanpa kembali ke catatan.",
      replies: [
        { who: { id: 'rina', initials: 'RA', name: 'Rina Astari' }, ago: "2 jam lalu", likes: 3, text: "Bagaimana cara Mas Rangga melawan gelisah itu di hari-hari pertama?" },
        { who: AUTHORS[1], ago: "1 jam lalu", isAuthor: true, likes: 7, text: "Tidak melawan, justru. Saya beri ruang untuk gelisah itu sambil tetap membaca. Sama seperti pikiran yang muncul saat meditasi — diakui, lalu kembali ke halaman." },
      ],
    },
    {
      who: { id: 'rina', initials: 'RA', name: 'Rina Astari' },
      ago: "5 jam lalu",
      likes: 12,
      text: "Bagian “jam, bukan halaman” menohok. Saya selalu kejar target halaman dan ujung-ujungnya stress sendiri. Mulai besok saya coba switch.",
      replies: [],
    },
    {
      who: { id: 'fadli', initials: 'FH', name: 'Fadli Hakim' },
      ago: "7 jam lalu",
      likes: 6,
      text: "Saya kembali ke kebiasaan ngasih catatan pakai pensil setelah baca esai ini bulan lalu. Sekarang setiap buku punya “percakapan” saya dengan penulisnya. Sangat membantu mood.",
      replies: [],
    },
  ];

  const CommentBody = ({ c, isReply }) => (
    <div style={{ display: 'flex', gap: 12, padding: isReply ? '12px 0 12px' : 0 }}>
      <Avatar size="sm" author={c.who} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{c.who.name}</span>
          {c.isAuthor && <span className="badge badge-accent" style={{ height: 18, fontSize: 10, letterSpacing: '0.06em', padding: '0 7px' }}>PENULIS</span>}
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{c.ago}</span>
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg)' }}>{c.text}</p>
        <div style={{ display: 'flex', gap: 4, marginTop: 10, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" style={{ height: 28, padding: '0 8px', color: c.liked ? 'var(--accent-ink)' : 'var(--fg-3)', fontSize: 12.5 }}>
            <Icon name="heart" size={13} color={c.liked ? 'var(--accent-ink)' : 'currentColor'} /> {c.likes}
          </button>
          {!isReply && (
            <button className="btn btn-ghost btn-sm" style={{ height: 28, padding: '0 8px', color: 'var(--fg-3)', fontSize: 12.5 }}>
              <Icon name="comment" size={13} /> Balas
            </button>
          )}
          <button className="btn btn-ghost btn-sm" style={{ height: 28, padding: '0 8px', color: 'var(--fg-3)', fontSize: 12.5 }}>
            <Icon name="menu" size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  const total = COMMENTS.reduce((s, c) => s + 1 + c.replies.length, 0);

  return (
    <div id="comments" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 className="serif-title" style={{ fontSize: 22, margin: 0 }}>Diskusi · {total}</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-outline btn-sm">Terbaru</button>
          <button className="btn btn-ghost btn-sm">Paling disukai</button>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
        <Avatar size="sm" author={{ id: 'rina', initials: 'RA' }} />
        <div style={{ flex: 1 }}>
          <textarea className="input" style={{ height: 88, padding: 12, lineHeight: 1.5, resize: 'none' }} placeholder="Tambahkan komentar… diskusi ini eksklusif untuk member."></textarea>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Berkomentar sebagai <strong style={{ color: 'var(--fg-2)' }}>Rina Astari</strong></div>
            <button className="btn btn-primary btn-sm">Kirim komentar</button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ display: 'grid', gap: 24 }}>
        {COMMENTS.map((c, i) => (
          <div key={i} style={{ background: c.pinned ? 'var(--surface)' : 'transparent', padding: c.pinned ? 18 : 0, borderRadius: c.pinned ? 12 : 0, border: c.pinned ? '1px solid var(--border)' : 'none' }}>
            {c.pinned && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: 'var(--accent-ink)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                <Icon name="bookmark" size={11} color="var(--accent-ink)" /> Disematkan oleh penulis
              </div>
            )}
            <CommentBody c={c} />
            {c.replies.length > 0 && (
              <div style={{ marginLeft: 40, marginTop: 4, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
                {c.replies.map((r, j) => <CommentBody key={j} c={r} isReply />)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button className="btn btn-outline btn-sm">Muat 15 komentar lagi</button>
      </div>
    </div>
  );
}

function Paywall() {
  return (
    <div style={{ position: 'relative', marginTop: -120, marginBottom: 32 }}>
      {/* Fade overlay over the preview */}
      <div style={{ height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg))', position: 'relative', top: 0 }}></div>
      <div className="card" style={{ padding: '36px 40px', textAlign: 'center', borderColor: 'var(--border-2)', boxShadow: 'var(--shadow-2)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 16 }}>
          <Icon name="lock" size={11} /> SISA TULISAN UNTUK MEMBER
        </div>
        <h2 className="serif-title" style={{ fontSize: 26, margin: '0 0 12px', maxWidth: 480, marginInline: 'auto' }}>
          Selebihnya tersedia untuk pelanggan Lentera
        </h2>
        <p style={{ color: 'var(--fg-2)', fontSize: 15.5, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
          Berlangganan untuk membaca tulisan ini sampai habis, plus akses ke seluruh arsip dan esai baru tiap pekan.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 18 }}>
          <button className="btn btn-accent btn-lg">Berlangganan — mulai Rp 39.000/bln</button>
          <button className="btn btn-outline btn-lg">Sudah punya akun? Masuk</button>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Akses langsung setelah bayar · Batalkan kapan saja</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          {[
            ['Akses penuh', 'Semua arsip 142 tulisan'],
            ['Esai mingguan', 'Tiap Sabtu pagi langsung di email'],
            ['Komunitas', 'Diskusi & komentar member'],
          ].map(([t, s]) => (
            <div key={t} style={{ textAlign: 'left', maxWidth: 160 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveDialog({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,26,23,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="card" style={{ width: 420, padding: 24, boxShadow: 'var(--shadow-3)' }} onClick={e => e.stopPropagation()}>
        <h3 className="serif-title" style={{ fontSize: 20, margin: '0 0 4px' }}>Simpan ke folder</h3>
        <p style={{ fontSize: 13.5, color: 'var(--fg-3)', margin: '0 0 16px' }}>Atur tulisan ini ke salah satu folder kamu.</p>
        <div style={{ display: 'grid', gap: 4, marginBottom: 16 }}>
          {[
            ['Untuk dibaca ulang', 12, true],
            ['Tentang menulis', 8, false],
            ['Pelan-pelan saja', 23, false],
          ].map(([name, count, sel]) => (
            <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: sel ? 'var(--surface)' : 'transparent' }}>
              <input type="checkbox" defaultChecked={sel} style={{ width: 16, height: 16, accentColor: 'var(--fg)' }} />
              <Icon name="folder" />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{count} tulisan</span>
            </label>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--fg-2)' }}>
          <Icon name="plus" /> Buat folder baru
        </button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Batal</button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

function ReadingProgressBar({ pct = 38 }) {
  return (
    <div style={{ position: 'sticky', top: 64, zIndex: 9, height: 3, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width .15s linear' }}></div>
    </div>
  );
}

function SeriesNav() {
  return (
    <div style={{ marginTop: 48, padding: '22px 24px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elev)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="list" size={14} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bagian dari series</div>
            <a href="#" className="serif-title" style={{ fontSize: 17, color: 'var(--fg)', textDecoration: 'none' }}>Belajar Membaca Pelan</a>
          </div>
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>1 / 6</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button disabled className="card" style={{ textAlign: 'left', padding: 14, opacity: .5, cursor: 'not-allowed', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'inherit', background: 'transparent' }}>
          <span style={{ fontSize: 11.5, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="arrowLeft" size={11} /> Bagian sebelumnya
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Ini bagian pertama series</span>
        </button>
        <a href="#" className="card" style={{ textAlign: 'right', padding: 14, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11.5, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            Bagian berikutnya <Icon name="arrow" size={11} />
          </span>
          <span className="serif-title" style={{ fontSize: 15, fontWeight: 600 }}>Buku Bukan Konten — dan Kita Bukan Audiens</span>
        </a>
      </div>
    </div>
  );
}

function ArticlePage({ variant }) {
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [showSave, setShowSave] = React.useState(variant === 'member-savedialog');
  const isMember = variant === 'member' || variant === 'member-savedialog';

  return (
    <div className="pub-page scroll-y">
      <TopBar active="home" isMember={isMember} />
      {variant !== 'paywall' && <ReadingProgressBar pct={variant === 'free' ? 28 : 42} />}

      <article style={{ maxWidth: 1040, margin: '0 auto', padding: '56px 32px 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <Tag>{ARTICLE.tag}</Tag>
            {ARTICLE.premium && <PremiumBadge />}
          </div>
          <h1 className="serif-title" style={{ fontSize: 48, margin: '0 0 18px', letterSpacing: '-0.025em' }}>{ARTICLE.title}</h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--fg-2)', lineHeight: 1.5, fontWeight: 400, margin: '0 0 28px' }}>{ARTICLE.subtitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
            <Avatar author={ARTICLE.author} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{ARTICLE.author.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{ARTICLE.date} · {ARTICLE.readTime} menit baca</div>
            </div>
            {!isMember && variant === 'free' && (
              <button className="btn btn-outline btn-sm"><Icon name="plus" size={13} /> Berlangganan</button>
            )}
          </div>
        </div>

        <div className="placeholder-img" style={{ maxWidth: 920, height: 420, margin: '40px auto 48px' }} data-caption="hero · books-on-wooden-table"></div>

        <div className="prose" style={{ maxWidth: 680, margin: '0 auto' }}>
          {variant === 'paywall'
            ? <><ProseBlocks blocks={ARTICLE_BODY_PREVIEW} /><Paywall /></>
            : <ProseBlocks blocks={ARTICLE_BODY_FULL} />
          }

          {variant !== 'paywall' && (
            <ActionRail liked={liked} setLiked={setLiked} saved={saved} setSaved={(v) => { setSaved(v); if (v) setShowSave(true); }} isMember={isMember} />
          )}

          {variant !== 'paywall' && <SeriesNav />}

          <AuthorCard author={ARTICLE.author} />

          {isMember && <Comments />}

          <RelatedArticles />
        </div>
      </article>

      <PubFooter />

      <SaveDialog open={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}

window.ArticlePage = ArticlePage;
