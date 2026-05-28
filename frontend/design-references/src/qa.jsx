/* Q&A pages — reader-facing
   Two variants: 'list' and 'detail' */

const QA_QUESTIONS = [
  {
    id: 'q1',
    title: 'Bagaimana cara menghidupkan kembali kebiasaan membaca setelah lima tahun ‘mengalah’ ke feed?',
    body: 'Saya pernah jadi pembaca rakus. Lalu Twitter datang, lalu Instagram, lalu reels. Sekarang tiap saya buka buku, dalam dua paragraf saya sudah ingin scroll. Apa langkah pertama yang paling realistis?',
    asker: { id: 'maya', initials: 'ML', name: 'Maya Larasati' },
    askedAt: '4 jam lalu',
    upvotes: 87,
    upvoted: true,
    answersCount: 5,
    answeredBy: AUTHORS[0],
    tag: 'Kebiasaan',
    status: 'answered',
    featured: true,
  },
  {
    id: 'q2',
    title: 'Apakah ada bedanya membaca buku fisik dengan e-book untuk retensi jangka panjang?',
    body: 'Selama ini saya pakai Kindle karena lebih praktis. Tapi anekdot dari teman bilang buku fisik “nempel” lebih lama. Adakah bukti atau opini berdasarkan pengalaman?',
    asker: { id: 'fadli', initials: 'FH', name: 'Fadli Hakim' },
    askedAt: '1 hari lalu',
    upvotes: 64,
    answersCount: 3,
    answeredBy: AUTHORS[1],
    tag: 'Buku',
    status: 'answered',
  },
  {
    id: 'q3',
    title: 'Saran buku untuk pemula yang mau membangun pondasi membaca lambat — bukan self-help, bukan terlalu akademis?',
    body: 'Cari rekomendasi yang sweet spot antara enak dibaca tapi tetap bikin mikir.',
    asker: { id: 'bagas', initials: 'BP', name: 'Bagas Pratama' },
    askedAt: '2 hari lalu',
    upvotes: 42,
    answersCount: 8,
    tag: 'Buku',
    status: 'answered',
  },
  {
    id: 'q4',
    title: 'Bagaimana mengelola FOMO terhadap konten yang “harus” dibaca?',
    body: 'Tiap minggu newsletter favorit saya datang dengan link "10 artikel wajib". Saya cuma sempat baca 2. Sisanya bikin gelisah.',
    asker: { id: 'putri', initials: 'PA', name: 'Putri Anggraini' },
    askedAt: '3 hari lalu',
    upvotes: 38,
    answersCount: 4,
    tag: 'Kebiasaan',
    status: 'answered',
  },
  {
    id: 'q5',
    title: 'Apakah “deep work” bisa dilatih, atau itu bawaan dari kecil?',
    body: 'Pertanyaan jujur. Saya merasa otak saya sudah “rusak” karena kerja yang interruption-heavy selama 8 tahun.',
    asker: { id: 'reza', initials: 'RM', name: 'Reza Mahendra' },
    askedAt: '5 hari lalu',
    upvotes: 31,
    answersCount: 0,
    tag: 'Kebiasaan',
    status: 'pending',
  },
  {
    id: 'q6',
    title: 'Mas Rangga, di esai bulan lalu kamu bilang notifikasi adalah "bunyi yang menjual perhatian kita". Tapi bagaimana dengan notifikasi yang penting (anak, kerja kritis)?',
    body: 'Apakah ada framework untuk membedakan yang layak ditanggapi vs yang tidak?',
    asker: { id: 'indah', initials: 'IP', name: 'Indah Permatasari' },
    askedAt: '1 minggu lalu',
    upvotes: 24,
    answersCount: 0,
    tag: 'Teknologi',
    status: 'pending',
  },
];

function QuestionRow({ q, isDetail }) {
  return (
    <div style={{ display: 'flex', gap: 18, padding: '20px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      {/* Upvote */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, paddingTop: 4 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 8, border: q.upvoted ? '1.5px solid var(--accent)' : '1px solid var(--border-2)',
          background: q.upvoted ? 'var(--accent-soft)' : 'var(--bg-elev)',
          color: q.upvoted ? 'var(--accent-ink)' : 'var(--fg-3)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8L6.5 3L11 8"/></svg>
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: q.upvoted ? 'var(--accent-ink)' : 'var(--fg-2)', fontFamily: 'var(--mono)' }}>{q.upvotes}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {q.featured && <span className="badge badge-accent"><Icon name="bookmark" size={10} /> Disorot minggu ini</span>}
          {q.status === 'answered'
            ? <span className="badge badge-success badge-dot">Terjawab · {q.answersCount} jawaban</span>
            : <span className="badge badge-soft">Belum dijawab</span>}
          <Tag>{q.tag}</Tag>
        </div>
        <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="serif-title" style={{ fontSize: isDetail ? 20 : 21, margin: '0 0 8px', lineHeight: 1.3 }}>{q.title}</h3>
        </a>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--fg-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar size="sm" author={q.asker} />
            <span style={{ color: 'var(--fg-2)' }}>{q.asker.name}</span>
          </div>
          <span>·</span>
          <span><Icon name="clock" size={11} /> {q.askedAt}</span>
          {q.answeredBy && (
            <>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Dijawab oleh <Avatar size="sm" author={q.answeredBy} /> <strong style={{ color: 'var(--fg-2)' }}>{q.answeredBy.name}</strong>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QAListPage() {
  return (
    <div className="pub-page scroll-y">
      <TopBar active="qa" isMember />

      {/* Hero strip */}
      <section style={{ padding: '48px 32px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>Q&amp;A</div>
              <h1 className="serif-title" style={{ fontSize: 40, margin: '0 0 10px', letterSpacing: '-0.025em' }}>Pertanyaan & jawaban</h1>
              <p style={{ fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.55, maxWidth: 540, margin: 0, fontFamily: 'var(--serif)' }}>
                Tempat member bertanya apa saja tentang membaca, menulis, dan kebiasaan. Penulis Lentera akan menjawab yang paling sering muncul.
              </p>
            </div>
            <button className="btn btn-accent btn-lg" style={{ flexShrink: 0 }}><Icon name="plus" size={14} /> Tanya sesuatu</button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, fontSize: 13, color: 'var(--fg-3)' }}>
            <span><strong style={{ color: 'var(--fg)', fontSize: 15 }}>148</strong> pertanyaan</span>
            <span><strong style={{ color: 'var(--fg)', fontSize: 15 }}>92%</strong> terjawab dalam 48 jam</span>
            <span><strong style={{ color: 'var(--fg)', fontSize: 15 }}>3</strong> penulis menjawab</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 64px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 36, alignItems: 'flex-start' }}>
        {/* Main */}
        <main>
          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 320 }}>
              <input className="input" placeholder="Cari pertanyaan…" style={{ paddingLeft: 36 }} />
              <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--fg-3)' }}><Icon name="search" size={14} /></span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                ['Semua', true],
                ['Terjawab', false],
                ['Belum dijawab', false],
                ['Yang saya tanyakan', false],
              ].map(([label, active]) => (
                <button key={label} className={`btn btn-sm ${active ? 'btn-outline' : 'btn-ghost'}`}>{label}</button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <select className="input" style={{ width: 160, height: 32, fontSize: 13, padding: '0 10px' }}>
              <option>Paling banyak upvote</option>
              <option>Terbaru</option>
              <option>Belum dijawab dulu</option>
            </select>
          </div>

          {/* Question list */}
          <div>
            {QA_QUESTIONS.map(q => <QuestionRow key={q.id} q={q} />)}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
            <button className="btn btn-outline btn-sm">Muat 12 pertanyaan lagi</button>
          </div>
        </main>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 88 }}>
          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Topik populer</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Kebiasaan · 48', 'Buku · 36', 'Teknologi · 24', 'Filsafat · 18', 'Menulis · 14', 'Esai · 8'].map(t => (
                <a key={t} href="#" className="badge badge-soft" style={{ height: 26, padding: '0 10px', textDecoration: 'none', cursor: 'pointer' }}>{t}</a>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Penulis yang menjawab</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {AUTHORS.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar size="sm" author={a} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{Math.floor(Math.random() * 30) + 12} jawaban</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 18, background: 'var(--accent-soft)', borderRadius: 12, fontSize: 13, lineHeight: 1.55, color: 'var(--accent-ink)' }}>
            <strong style={{ color: 'var(--accent-ink)' }}>Cara kerja Q&amp;A.</strong> Member bisa bertanya dan upvote. Penulis menjawab pertanyaan dengan upvote tertinggi, biasanya seminggu sekali.
          </div>
        </aside>
      </div>

      <PubFooter />
    </div>
  );
}

function QADetailPage() {
  const q = QA_QUESTIONS[0];
  const officialAnswer = {
    author: AUTHORS[0],
    isPinned: true,
    isOfficial: true,
    postedAt: '2 jam lalu',
    upvotes: 64,
    upvoted: true,
    body: [
      "Pertanyaan yang saya juga tanyakan ke diri sendiri lima tahun lalu, dan tidak ada satu jawaban tunggal yang memuaskan. Tapi ada urutan yang saya kira lebih masuk akal daripada langsung memaksakan diri membaca buku setebal 500 halaman.",
      "**Langkah pertama:** turunkan ekspektasi. Mulailah dengan tujuh menit, bukan tujuh puluh. Tujuh menit terlalu pendek untuk gagal — dan justru karena pendek, kamu cenderung mengulanginya besok. Konsistensi mengalahkan intensitas, terutama di awal.",
      "**Kedua:** pilih bacaan yang \"susah dilepaskan\", bukan yang \"penting\". Novel pendek, esai pribadi, atau kumpulan cerpen. Tujuannya bukan menjadi pintar, tapi membangun ulang sirkuit untuk menikmati halaman.",
      "**Ketiga:** matikan notifikasi selama jendela kecil itu. Bukan untuk produktivitas — untuk membuktikan ke diri sendiri bahwa dunia tidak runtuh dalam tujuh menit tanpa kita.",
      "Yang paling berat justru bukan langkah-langkahnya, melainkan rasa bersalah karena \"cuma\" baca sedikit. Lawan itu dengan mengingat: kamu sedang melatih ulang otot yang sudah lama dikondisikan untuk bergerak cepat.",
    ],
  };

  const otherAnswers = [
    {
      author: AUTHORS[2],
      postedAt: '6 jam lalu',
      upvotes: 22,
      body: "Saya menambahkan satu praktik kecil: tutup buku dengan sengaja di tempat yang menarik. Bukan pas selesai bab. Pas penasaran. Bikin ingin kembali, dan menghapus kecemasan \"harus habis hari ini\".",
    },
    {
      author: { id: 'maya', initials: 'ML', name: 'Maya Larasati' },
      postedAt: '8 jam lalu',
      upvotes: 14,
      body: "Bukan jawaban resmi tapi pengalaman pribadi: saya menaruh buku di sebelah charger HP. Tiap mau colok HP, tangan saya mampir dulu ke buku. Trik konyol tapi works.",
    },
  ];

  return (
    <div className="pub-page scroll-y">
      <TopBar active="qa" isMember />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 32px 64px' }}>
        {/* Back link */}
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--fg-2)', textDecoration: 'none', marginBottom: 24 }}>
          <Icon name="arrowLeft" size={14} /> Semua pertanyaan
        </a>

        {/* Question hero */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button style={{
              width: 48, height: 48, borderRadius: 10, border: '1.5px solid var(--accent)',
              background: 'var(--accent-soft)', color: 'var(--accent-ink)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11L9 5L15 11"/></svg>
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-ink)', fontFamily: 'var(--serif)' }}>{q.upvotes}</span>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>upvote</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-success badge-dot">Terjawab</span>
              <Tag>{q.tag}</Tag>
            </div>
            <h1 className="serif-title" style={{ fontSize: 30, margin: '0 0 14px', letterSpacing: '-0.015em', lineHeight: 1.25 }}>{q.title}</h1>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--fg-2)', lineHeight: 1.65, margin: '0 0 18px' }}>{q.body}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5, color: 'var(--fg-3)' }}>
              <Avatar size="sm" author={q.asker} />
              <span><strong style={{ color: 'var(--fg-2)' }}>{q.asker.name}</strong> bertanya {q.askedAt}</span>
              <span>·</span>
              <a href="#" style={{ color: 'inherit' }}><Icon name="share" size={13} /> Bagikan</a>
              <a href="#" style={{ color: 'inherit' }}><Icon name="bookmark" size={13} /> Ikuti</a>
            </div>
          </div>
        </div>

        {/* Answers header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36, marginBottom: 16 }}>
          <h2 className="serif-title" style={{ fontSize: 22, margin: 0 }}>{1 + otherAnswers.length} jawaban</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-outline btn-sm">Paling upvote</button>
            <button className="btn btn-ghost btn-sm">Terbaru</button>
          </div>
        </div>

        {/* Official + pinned answer */}
        <div style={{ background: 'var(--bg-elev)', border: '2px solid var(--accent)', borderRadius: 14, padding: 28, position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', top: -12, left: 24, background: 'var(--accent)', color: '#fff', padding: '4px 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="bookmark" size={11} /> JAWABAN RESMI · DISEMATKAN
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--accent-soft)', color: 'var(--accent-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7L6 3L10 7"/></svg>
              </button>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--accent-ink)' }}>{officialAnswer.upvotes}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Avatar author={officialAnswer.author} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{officialAnswer.author.name}</span>
                    <span className="badge badge-accent" style={{ height: 18, fontSize: 10, letterSpacing: '0.06em' }}>PENULIS</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{officialAnswer.author.role} · {officialAnswer.postedAt}</div>
                </div>
              </div>
              <div className="prose" style={{ fontSize: 16.5 }}>
                {officialAnswer.body.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm"><Icon name="heart" size={13} /> Suka · 42</button>
                <button className="btn btn-ghost btn-sm"><Icon name="comment" size={13} /> Balas</button>
                <button className="btn btn-ghost btn-sm"><Icon name="share" size={13} /> Bagikan</button>
              </div>
            </div>
          </div>
        </div>

        {/* Other answers */}
        {otherAnswers.map((a, i) => (
          <div key={i} className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-elev)', color: 'var(--fg-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7L6 3L10 7"/></svg>
                </button>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--fg-2)' }}>{a.upvotes}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Avatar size="sm" author={a.author} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{a.author.name}</span>
                      {AUTHORS.some(au => au.id === a.author.id) && <span className="badge badge-accent" style={{ height: 18, fontSize: 10, letterSpacing: '0.06em' }}>PENULIS</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{a.postedAt}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--fg)', margin: 0, fontFamily: 'var(--serif)' }}>{a.body}</p>
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                  <button className="btn btn-ghost btn-sm"><Icon name="heart" size={13} /> Suka · {Math.floor(a.upvotes / 3)}</button>
                  <button className="btn btn-ghost btn-sm"><Icon name="comment" size={13} /> Balas</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Submit your answer */}
        <div className="card" style={{ padding: 24, marginTop: 16 }}>
          <h3 className="serif-title" style={{ fontSize: 18, margin: '0 0 10px' }}>Tambahkan jawaban kamu</h3>
          <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: '0 0 14px' }}>Member bisa menjawab pertanyaan member lain. Jawaban yang membantu akan di-upvote dan bisa disematkan oleh penulis.</p>
          <textarea className="input" style={{ height: 120, padding: 14, lineHeight: 1.6, resize: 'none', fontFamily: 'var(--serif)', fontSize: 15 }} placeholder="Tulis jawaban kamu… markdown didukung."></textarea>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-3)' }}>
              <Avatar size="sm" author={{ id: 'rina', initials: 'RA' }} />
              <span>Menjawab sebagai <strong style={{ color: 'var(--fg-2)' }}>Rina Astari</strong></span>
            </div>
            <button className="btn btn-primary btn-sm">Kirim jawaban</button>
          </div>
        </div>
      </div>

      <PubFooter />
    </div>
  );
}

window.QAListPage = QAListPage;
window.QADetailPage = QADetailPage;
