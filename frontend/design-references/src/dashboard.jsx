/* Dashboard chrome + Overview + Articles list */

function DashSidebar({ active }) {
  return (
    <aside className="dash-sidebar">
      <div style={{ padding: '4px 12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 28, height: 28, background: 'var(--fg)', color: 'var(--bg)', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 15, fontStyle: 'italic' }}>L</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif-title" style={{ fontSize: 15, lineHeight: 1 }}>Lentera</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>lentera.id</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" title="Beralih publication"><Icon name="chevronDown" size={14} /></button>
      </div>

      <div className="dash-nav-section">Publication</div>
      <DashNav active={active} items={[
        ['overview', 'grid', 'Overview'],
        ['articles', 'file', 'Artikel'],
        ['series',   'list', 'Series'],
        ['roadmap',  'chart', 'Roadmap'],
        ['qa',       'comment', 'Q&A'],
      ]} />

      <div className="dash-nav-section">Audience</div>
      <DashNav active={active} items={[
        ['subscribers', 'users', 'Subscriber'],
        ['analytics',   'chart', 'Analytics'],
      ]} />

      <div className="dash-nav-section">Pengaturan</div>
      <DashNav active={active} items={[
        ['settings-general', 'settings', 'Umum'],
        ['settings-plans',   'dollar',   'Paket harga'],
        ['settings-authors', 'users',    'Author'],
      ]} />

      <div style={{ marginTop: 'auto', padding: 12, display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)' }}>
        <Avatar size="sm" author={AUTHORS[0]} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{AUTHORS[0].name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>Owner</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm"><Icon name="chevron" size={14} /></button>
      </div>
    </aside>
  );
}

function DashNav({ active, items }) {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      {items.map(([id, icon, label]) => (
        <div key={id} className={`dash-nav-item ${active === id ? 'active' : ''}`}>
          <Icon name={icon} size={15} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function DashTopBar({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 36px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div>
        <h1 className="serif-title" style={{ fontSize: 26, margin: 0, letterSpacing: '-0.015em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13.5, color: 'var(--fg-3)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, delta, deltaLabel, sparkline }) {
  const positive = delta && delta.startsWith('+');
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ fontSize: 12.5, color: 'var(--fg-3)', fontWeight: 500, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 8 }}>
        <div className="serif-title" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>{value}</div>
        {sparkline}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
        <span style={{ color: positive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{delta}</span> {deltaLabel}
      </div>
    </div>
  );
}

function Sparkline({ color = 'var(--fg-3)', data = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 16] }) {
  const w = 80, h = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniChart() {
  // simple bar chart of weekly views
  const bars = [40, 55, 48, 70, 62, 80, 75, 88, 90, 82, 95, 110];
  const labels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
  const max = Math.max(...bars);
  return (
    <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="serif-title" style={{ fontSize: 18, marginBottom: 4 }}>Views per bulan</div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>12 bulan terakhir</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm">12 bln</button>
          <button className="btn btn-ghost btn-sm">6 bln</button>
          <button className="btn btn-ghost btn-sm">30 hr</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${bars.length}, 1fr)`, alignItems: 'flex-end', gap: 8, height: 180 }}>
        {bars.map((v, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: i === bars.length - 1 ? 'var(--fg)' : 'var(--surface-2)', borderRadius: 4, transition: 'all .2s' }}></div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardOverview() {
  const recent = ARTICLES.slice(0, 4);
  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="overview" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Overview"
          subtitle="Sapaan pagi, Anya. Ini ringkasan minggu ini."
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline"><Icon name="eye" size={14} /> Lihat publication</button>
              <button className="btn btn-primary"><Icon name="plus" size={14} /> Tulis baru</button>
            </div>
          }
        />
        <div style={{ padding: 36, flex: 1 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            <StatCard label="Subscriber aktif" value="8.420" delta="+128" deltaLabel="dari bulan lalu" sparkline={<Sparkline />} />
            <StatCard label="MRR" value="Rp 32,4 jt" delta="+4,2%" deltaLabel="MoM" sparkline={<Sparkline color="var(--accent)" />} />
            <StatCard label="Views (30 hari)" value="48.210" delta="+12%" deltaLabel="vs 30 hari sblm" sparkline={<Sparkline />} />
            <StatCard label="Open rate email" value="62%" delta="−1,4%" deltaLabel="dari rata-rata" sparkline={<Sparkline color="var(--danger)" />} />
          </div>

          {/* Chart + recent */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
            <MiniChart />
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div className="serif-title" style={{ fontSize: 18 }}>Performa artikel</div>
                <a href="#" style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }}>Semua →</a>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {recent.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottom: i === recent.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ width: 18, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', paddingTop: 3 }}>0{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{a.date} · {a.author.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 60 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)' }}>{(1240 - i * 180).toLocaleString('id-ID')}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div className="serif-title" style={{ fontSize: 18, marginBottom: 16 }}>Aktivitas terbaru</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  ['Dimas Wibowo', 'mempublikasikan', '“Pembelaan Singkat untuk Basa-basi”', '2 jam lalu'],
                  ['12 subscriber baru', 'bergabung minggu ini', '', '5 jam lalu'],
                  ['Rangga Saputra', 'menyimpan draft', '“Notifikasi sebagai Kebiasaan”', 'Kemarin'],
                  ['Sari Kusuma', 'mengundang author', 'menunggu konfirmasi', '2 hari lalu'],
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, lineHeight: 1.5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: i === 0 ? 'var(--accent)' : 'var(--border-2)', marginTop: 7, flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{row[0]}</span> <span style={{ color: 'var(--fg-2)' }}>{row[1]}</span> <span style={{ fontStyle: row[2] ? 'italic' : 'normal' }}>{row[2]}</span>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{row[3]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 24, background: 'var(--surface)', border: 'none', position: 'relative' }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Perlu perhatian
              </div>
              <h3 className="serif-title" style={{ fontSize: 22, margin: '0 0 10px', lineHeight: 1.3 }}>
                Empat subscriber paket bulanan akan berakhir minggu depan.
              </h3>
              <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Kirim email pribadi untuk mempertinggi peluang perpanjangan. Template tersedia, atau tulis sendiri dari nol.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm">Lihat 4 subscriber</button>
                <button className="btn btn-ghost btn-sm">Pakai template</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardArticles() {
  const allArticles = [
    { ...ARTICLES[0], status: 'published', views: 1240, comments: 18, date: '18 Mei' },
    { ...ARTICLES[1], status: 'published', views: 1060, comments: 24, date: '14 Mei' },
    { ...ARTICLES[2], status: 'published', views: 880, comments: 9, date: '11 Mei' },
    { title: 'Notifikasi sebagai Kebiasaan: Mengapa Kita Kecanduan Bunyi', author: AUTHORS[1], tag: 'Teknologi', status: 'draft', date: 'Diedit kemarin', views: 0, comments: 0, premium: true },
    { ...ARTICLES[3], status: 'published', views: 740, comments: 15, date: '7 Mei' },
    { title: 'Tentang Kebosanan yang Produktif', author: AUTHORS[2], tag: 'Filsafat', status: 'scheduled', date: 'Terjadwal 25 Mei', views: 0, comments: 0, premium: false },
    { ...ARTICLES[4], status: 'published', views: 1100, comments: 28, date: '3 Mei' },
    { ...ARTICLES[5], status: 'published', views: 620, comments: 7, date: '28 Apr' },
  ];

  const statusBadge = (s) => {
    if (s === 'published') return <span className="badge badge-success badge-dot">Terbit</span>;
    if (s === 'draft')     return <span className="badge badge-soft">Draft</span>;
    if (s === 'scheduled') return <span className="badge badge-accent">Terjadwal</span>;
  };

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="articles" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Artikel"
          subtitle={`${allArticles.length} tulisan total · ${allArticles.filter(a => a.status === 'draft').length} draft · ${allArticles.filter(a => a.status === 'scheduled').length} terjadwal`}
          action={<button className="btn btn-primary"><Icon name="plus" size={14} /> Tulis baru</button>}
        />
        <div style={{ padding: 36, flex: 1 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Icon name="search" size={14} color="var(--fg-3)" />
              <input className="input" placeholder="Cari judul atau isi…" style={{ paddingLeft: 36 }} />
              <span style={{ position: 'absolute', left: 12, top: 13 }}><Icon name="search" size={14} color="var(--fg-3)" /></span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['Semua', 'Terbit', 'Draft', 'Terjadwal'].map((t, i) => (
                <button key={t} className={`btn btn-sm ${i === 0 ? 'btn-outline' : 'btn-ghost'}`}>{t}</button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn-outline btn-sm"><Icon name="filter" size={13} /> Author: Semua</button>
            <button className="btn btn-outline btn-sm"><Icon name="filter" size={13} /> Tag</button>
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Judul</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Views</th>
                  <th style={{ textAlign: 'right' }}>Komentar</th>
                  <th>Tanggal</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {allArticles.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="placeholder-img" style={{ width: 48, height: 36, flexShrink: 0 }} data-caption=""></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{a.title}</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <Tag>{a.tag}</Tag>
                            {a.premium && <PremiumBadge />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar size="sm" author={a.author} />
                        <span style={{ fontSize: 13 }}>{a.author.name.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td>{statusBadge(a.status)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>{a.views ? a.views.toLocaleString('id-ID') : '—'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>{a.comments || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--fg-3)' }}>{a.date}</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm"><Icon name="menu" size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 13, color: 'var(--fg-3)' }}>
            <span>Menampilkan 1–8 dari 142 tulisan</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-outline btn-sm" disabled style={{ opacity: .4 }}>Sebelumnya</button>
              <button className="btn btn-outline btn-sm">Berikutnya <Icon name="arrow" size={13} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardOverview = DashboardOverview;
window.DashboardArticles = DashboardArticles;
