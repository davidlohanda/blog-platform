/* Search Results Page */

function SearchPage() {
  const query = "membaca pelan";
  const articleResults = [
    { ...ARTICLES[0], match: "Saya tidak selalu seperti ini. Selama bertahun-tahun, **membaca** buku saya perlakukan seperti pekerjaan…" },
    { ...ARTICLES[3], match: "Bukan karena romantis. Saya cuma menyadari bahwa beberapa pikiran tidak mau muncul lewat keyboard dan butuh **membaca** ulang…" },
    { ...ARTICLES[5], match: "Tiga puluh menit ritual pagi tanpa scroll — termasuk **membaca** satu paragraf esai yang lambat…" },
  ];
  const seriesResults = [
    { title: "Belajar Membaca Pelan", count: 6, author: AUTHORS[0], desc: "Enam esai pendek tentang membaca, perhatian, dan apa yang kita lupakan saat scrolling." },
  ];

  return (
    <div className="pub-page scroll-y">
      <TopBar isMember />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 32px 64px' }}>
        {/* Big search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input className="input" defaultValue={query}
            style={{ height: 56, fontSize: 18, paddingLeft: 56, paddingRight: 16, fontFamily: 'var(--serif)', borderColor: 'var(--fg)' }}
            placeholder="Cari tulisan, series, atau topik…" />
          <span style={{ position: 'absolute', left: 20, top: 18, color: 'var(--fg-2)' }}>
            <Icon name="search" size={20} />
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--fg-3)', marginBottom: 28 }}>
          <strong style={{ color: 'var(--fg-2)' }}>{articleResults.length + seriesResults.length + 2}</strong> hasil untuk “{query}” · dalam 0,12 detik
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 36, alignItems: 'flex-start' }}>
          {/* Filters */}
          <aside>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Tipe konten</div>
            <div style={{ display: 'grid', gap: 4, marginBottom: 24 }}>
              {[
                ['Semua', 6, true],
                ['Artikel', 3, false],
                ['Series', 1, false],
                ['Roadmap', 2, false],
              ].map(([label, count, active]) => (
                <button key={label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 6, background: active ? 'var(--surface)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--fg-2)',
                  }}>
                  <span style={{ fontWeight: active ? 600 : 400, color: active ? 'var(--fg)' : 'var(--fg-2)' }}>{label}</span>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{count}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Penulis</div>
            <div style={{ display: 'grid', gap: 6, marginBottom: 24 }}>
              {AUTHORS.map((a, i) => (
                <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', cursor: 'pointer', fontSize: 13.5 }}>
                  <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: 'var(--fg)' }} />
                  <Avatar size="sm" author={a} />
                  <span style={{ flex: 1 }}>{a.name}</span>
                </label>
              ))}
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Tag</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
              {['Esai', 'Kebiasaan', 'Teknologi', 'Filsafat', 'Buku'].map((t, i) => (
                <button key={t} className={`badge ${i < 2 ? 'badge-soft' : 'badge-soft'}`}
                  style={{ cursor: 'pointer', height: 26, fontSize: 12, padding: '0 10px', border: i < 2 ? '1.5px solid var(--fg)' : '1px solid var(--border)', background: i < 2 ? 'var(--bg-elev)' : 'var(--surface)' }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Urutkan</div>
            <div style={{ display: 'grid', gap: 4 }}>
              {['Paling relevan', 'Terbaru', 'Paling banyak dibaca'].map((s, i) => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', fontSize: 13.5 }}>
                  <input type="radio" name="sort" defaultChecked={i === 0} style={{ accentColor: 'var(--fg)' }} />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, color: 'var(--fg-3)' }}>Hapus semua filter</button>
          </aside>

          {/* Results */}
          <main>
            {/* Articles */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
                <h2 className="serif-title" style={{ fontSize: 20, margin: 0 }}>Artikel</h2>
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>· 3 hasil</span>
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                {articleResults.map(a => (
                  <a key={a.id} href="#" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 20, padding: '20px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                    <div className="placeholder-img" style={{ height: 100 }} data-caption={a.image}></div>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <Tag>{a.tag}</Tag>
                        {a.premium && <PremiumBadge />}
                      </div>
                      <h3 className="serif-title" style={{ fontSize: 22, margin: '0 0 8px' }} dangerouslySetInnerHTML={{ __html: a.title.replace(/(membaca|pelan)/gi, '<mark style="background:oklch(0.92 0.13 95);color:var(--fg);padding:0 2px;border-radius:2px">$1</mark>') }}></h3>
                      <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 10px' }} dangerouslySetInnerHTML={{ __html: a.match.replace(/\*\*(.+?)\*\*/g, '<mark style="background:oklch(0.92 0.13 95);color:var(--fg);padding:0 2px;border-radius:2px;font-weight:500">$1</mark>') }}></p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-3)' }}>
                        <Avatar size="sm" author={a.author} />
                        <span>{a.author.name}</span>
                        <span>·</span>
                        <span>{a.date}</span>
                        <span>·</span>
                        <span>{a.readTime} mnt</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Series */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
                <h2 className="serif-title" style={{ fontSize: 20, margin: 0 }}>Series</h2>
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>· 1 hasil</span>
              </div>
              {seriesResults.map((s, i) => (
                <a key={i} href="#" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 20, padding: '20px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                  <div className="placeholder-img" style={{ height: 180 }} data-caption="cover series"></div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Series · {s.count} bagian</div>
                    <h3 className="serif-title" style={{ fontSize: 24, margin: '0 0 10px' }} dangerouslySetInnerHTML={{ __html: s.title.replace(/(Membaca Pelan)/i, '<mark style="background:oklch(0.92 0.13 95);color:var(--fg);padding:0 2px;border-radius:2px">$1</mark>') }}></h3>
                    <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 10px' }}>{s.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-3)' }}>
                      <Avatar size="sm" author={s.author} />
                      <span>oleh {s.author.name}</span>
                    </div>
                  </div>
                </a>
              ))}
            </section>

            {/* Roadmap */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
                <h2 className="serif-title" style={{ fontSize: 20, margin: 0 }}>Roadmap</h2>
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>· 2 hasil</span>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { title: 'Roadmap Pembaca', desc: 'Pemula → Menengah → Lanjut. Tiga tahap untuk membangun ulang kebiasaan membaca.', stages: 3, items: 14 },
                  { title: 'Roadmap Penulisan Esai', desc: 'Dari catatan harian sampai esai panjang yang siap dipublikasikan.', stages: 4, items: 22 },
                ].map((r, i) => (
                  <a key={i} href="#" className="card" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="chart" size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="serif-title" style={{ fontSize: 17, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{r.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--fg-3)' }}>
                      <div>{r.stages} tahap</div>
                      <div>{r.items} item</div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

window.SearchPage = SearchPage;
