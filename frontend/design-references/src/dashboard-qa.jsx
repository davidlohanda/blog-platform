/* Dashboard — Q&A Management */

function DashboardQA() {
  const incomingQuestions = [
    {
      id: 'q1', title: 'Bagaimana cara menghidupkan kembali kebiasaan membaca setelah lima tahun ‘mengalah’ ke feed?',
      asker: { id: 'maya', initials: 'ML', name: 'Maya Larasati' },
      askedAt: '4 jam lalu', upvotes: 87, tag: 'Kebiasaan',
      status: 'pending', priority: 'high', selected: true,
    },
    {
      id: 'q5', title: 'Apakah “deep work” bisa dilatih, atau itu bawaan dari kecil?',
      asker: { id: 'reza', initials: 'RM', name: 'Reza Mahendra' },
      askedAt: '5 hari lalu', upvotes: 31, tag: 'Kebiasaan',
      status: 'pending', priority: 'medium',
    },
    {
      id: 'q6', title: 'Notifikasi penting vs distraksi — adakah framework untuk membedakannya?',
      asker: { id: 'indah', initials: 'IP', name: 'Indah Permatasari' },
      askedAt: '1 minggu lalu', upvotes: 24, tag: 'Teknologi',
      status: 'pending', priority: 'low',
    },
    {
      id: 'q3', title: 'Saran buku untuk pemula yang mau membangun pondasi membaca lambat',
      asker: { id: 'bagas', initials: 'BP', name: 'Bagas Pratama' },
      askedAt: '2 hari lalu', upvotes: 42, tag: 'Buku',
      status: 'answered', answersCount: 8, hasPinned: true,
    },
    {
      id: 'q2', title: 'Apakah ada bedanya membaca buku fisik dengan e-book untuk retensi?',
      asker: { id: 'fadli', initials: 'FH', name: 'Fadli Hakim' },
      askedAt: '1 hari lalu', upvotes: 64, tag: 'Buku',
      status: 'answered', answersCount: 3, hasPinned: true,
    },
    {
      id: 'q4', title: 'Bagaimana mengelola FOMO terhadap konten yang “harus” dibaca?',
      asker: { id: 'putri', initials: 'PA', name: 'Putri Anggraini' },
      askedAt: '3 hari lalu', upvotes: 38, tag: 'Kebiasaan',
      status: 'answered', answersCount: 4, hasPinned: false,
    },
  ];

  const activeQuestion = incomingQuestions[0];
  const draftAnswers = [
    { from: { id: 'maya', initials: 'ML', name: 'Maya Larasati', isMember: true }, age: '3 jam lalu', upvotes: 8, body: "Buat saya, langkah pertama justru menghapus app newsletter dari HP. Kalau sudah, mau tidak mau saya harus buka laptop, dan itu friction yang membantu." },
    { from: { id: 'fadli', initials: 'FH', name: 'Fadli Hakim', isMember: true }, age: '1 jam lalu', upvotes: 3, body: "Mungkin terdengar drastis, tapi saya akhirnya delete semua reader app. Kembali ke kindle paperwhite. Tidak ada Twitter di sana." },
  ];

  const statusBadge = (q) => {
    if (q.status === 'pending') {
      return q.priority === 'high'
        ? <span className="badge badge-accent badge-dot">Prioritas tinggi</span>
        : <span className="badge badge-soft">Belum dijawab</span>;
    }
    return q.hasPinned
      ? <span className="badge badge-success badge-dot">Terjawab · Disematkan</span>
      : <span className="badge badge-success">Terjawab</span>;
  };

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="qa" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <DashTopBar
          title="Q&A"
          subtitle="Kelola pertanyaan dari member · 14 menunggu jawaban · rata-rata respons 28 jam"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline"><Icon name="settings" size={14} /> Pengaturan Q&amp;A</button>
            </div>
          }
        />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: 0 }}>
          {/* Left — inbox */}
          <aside style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Filters */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input className="input" placeholder="Cari pertanyaan…" style={{ paddingLeft: 36, height: 36, fontSize: 13 }} />
                <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--fg-3)' }}><Icon name="search" size={14} /></span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  ['Belum dijawab', 14, true],
                  ['Terjawab', 134, false],
                  ['Disematkan', 28, false],
                  ['Semua', 148, false],
                ].map(([l, c, a]) => (
                  <button key={l} className={`btn btn-sm ${a ? 'btn-outline' : 'btn-ghost'}`} style={{ height: 28, fontSize: 12 }}>
                    {l} <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginLeft: 5 }}>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {incomingQuestions.map((q, i) => (
                <button key={q.id}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: q.selected ? 'var(--surface-2)' : 'transparent',
                    borderLeft: q.selected ? '3px solid var(--accent)' : '3px solid transparent',
                    border: 'none',
                    borderBottomColor: 'var(--border)', borderBottomStyle: 'solid', borderBottomWidth: 1,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Avatar size="sm" author={q.asker} />
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{q.asker.name}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{q.askedAt}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 8, color: q.selected ? 'var(--fg)' : 'var(--fg-2)' }}>{q.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {statusBadge(q)}
                    <Tag>{q.tag}</Tag>
                    <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6L5 3L8 6"/></svg>
                      {q.upvotes}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Right — detail + reply composer */}
          <main style={{ overflow: 'auto', padding: 32 }}>
            {/* Question detail */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="badge badge-accent badge-dot">Prioritas tinggi · upvote tinggi</span>
                <Tag>{activeQuestion.tag}</Tag>
                <div style={{ flex: 1 }}></div>
                <button className="btn btn-ghost btn-sm"><Icon name="bookmark" size={13} /> Tandai</button>
                <button className="btn btn-ghost btn-sm"><Icon name="share" size={13} /> Buka di Q&amp;A publik</button>
                <button className="btn btn-ghost btn-icon btn-sm"><Icon name="menu" size={14} /></button>
              </div>
              <h1 className="serif-title" style={{ fontSize: 26, margin: '0 0 14px', lineHeight: 1.3, letterSpacing: '-0.015em' }}>
                {activeQuestion.title}
              </h1>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.65, margin: '0 0 18px' }}>
                Saya pernah jadi pembaca rakus. Lalu Twitter datang, lalu Instagram, lalu reels. Sekarang tiap saya buka buku, dalam dua paragraf saya sudah ingin scroll. Apa langkah pertama yang paling realistis?
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: 'var(--surface)', borderRadius: 10, fontSize: 13 }}>
                <Avatar size="sm" author={activeQuestion.asker} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{activeQuestion.asker.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Member sejak Jan 2025 · 7 pertanyaan · 12 jawaban</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6L5 3L8 6"/></svg>
                    {activeQuestion.upvotes} upvote
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)', padding: '4px 10px' }}>{activeQuestion.askedAt}</span>
                </div>
              </div>
            </div>

            {/* Reply composer */}
            <div className="card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar size="sm" author={AUTHORS[0]} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Tulis jawaban resmi
                      <span className="badge badge-accent" style={{ height: 18, fontSize: 10, letterSpacing: '0.06em' }}>PENULIS</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>Menjawab sebagai {AUTHORS[0].name} · akan otomatis disematkan dan ditandai resmi</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['bold','italic','quote','list','link'].map(t => (
                    <button key={t} className="btn btn-ghost btn-icon btn-sm"><Icon name={t} size={13} /></button>
                  ))}
                </div>
              </div>
              <textarea
                className="input"
                style={{ height: 180, border: 'none', borderRadius: 0, padding: 20, lineHeight: 1.65, fontFamily: 'var(--serif)', fontSize: 16, resize: 'none' }}
                defaultValue="Pertanyaan yang saya juga tanyakan ke diri sendiri lima tahun lalu, dan tidak ada satu jawaban tunggal yang memuaskan. Tapi ada urutan yang saya kira lebih masuk akal daripada langsung memaksakan diri membaca buku setebal 500 halaman.

**Langkah pertama:** turunkan ekspektasi. Mulailah dengan tujuh menit, bukan tujuh puluh…"
              />
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: 'var(--fg-3)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--fg)' }} />
                    Sematkan sebagai jawaban resmi
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--fg)' }} />
                    Kirim email ke {activeQuestion.asker.name.split(' ')[0]}
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">Simpan draft</button>
                  <button className="btn btn-outline btn-sm"><Icon name="eye" size={13} /> Preview</button>
                  <button className="btn btn-primary btn-sm">Terbitkan jawaban</button>
                </div>
              </div>
            </div>

            {/* Member draft answers — can pin best */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 className="serif-title" style={{ fontSize: 17, margin: 0 }}>Jawaban dari member · {draftAnswers.length}</h3>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--fg-3)' }}>Urutkan: Upvote</button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {draftAnswers.map((a, i) => (
                  <div key={i} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, color: 'var(--fg-2)' }}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7L5.5 3L9 7"/></svg>
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)' }}>{a.upvotes}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Avatar size="sm" author={a.from} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{a.from.name}</span>
                          <span className="badge badge-soft" style={{ height: 18, fontSize: 10 }}>Member</span>
                          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{a.age}</span>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 10px', fontFamily: 'var(--serif)' }}>{a.body}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm"><Icon name="bookmark" size={12} /> Sematkan sebagai pilihan</button>
                          <button className="btn btn-ghost btn-sm">Beri tanda jempol</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--fg-3)' }}>Sembunyikan</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

window.DashboardQA = DashboardQA;
