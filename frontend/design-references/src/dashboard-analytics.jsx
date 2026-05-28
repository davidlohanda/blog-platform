/* Dashboard — Analytics */

function BigChart({ title, subtitle }) {
  // Two-line area chart: views vs reads
  const days = 30;
  const views = Array.from({ length: days }, (_, i) => 800 + Math.sin(i / 3) * 200 + Math.random() * 200 + i * 18);
  const reads = views.map(v => v * (0.42 + Math.random() * 0.08));
  const W = 760, H = 220, P = 24;
  const max = Math.max(...views) * 1.1;
  const xs = (i) => P + (i / (days - 1)) * (W - P * 2);
  const ys = (v) => H - P - (v / max) * (H - P * 2);
  const pathView = views.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ');
  const pathRead = reads.map((v, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(v)}`).join(' ');
  const areaView = pathView + ` L${xs(days-1)},${H-P} L${xs(0)},${H-P} Z`;

  return (
    <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div className="serif-title" style={{ fontSize: 18, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm">30 hari</button>
          <button className="btn btn-ghost btn-sm">90 hari</button>
          <button className="btn btn-ghost btn-sm">1 tahun</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 14, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, background: 'var(--fg)', borderRadius: 2 }}></span>
          <span style={{ color: 'var(--fg-2)' }}>Views</span>
          <strong style={{ fontFamily: 'var(--mono)' }}>48.210</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, background: 'var(--accent)', borderRadius: 2 }}></span>
          <span style={{ color: 'var(--fg-2)' }}>Reads</span>
          <strong style={{ fontFamily: 'var(--mono)' }}>20.418</strong>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--fg-3)' }}>Read rate: <strong style={{ color: 'var(--fg)' }}>42,3%</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220 }}>
        {[0.25, 0.5, 0.75, 1].map((p, i) => (
          <g key={i}>
            <line x1={P} y1={H-P-(H-P*2)*p} x2={W-P} y2={H-P-(H-P*2)*p} stroke="var(--border)" strokeDasharray="2 4" />
            <text x={P-6} y={H-P-(H-P*2)*p+4} fontSize={10} fill="var(--fg-3)" textAnchor="end" fontFamily="var(--mono)">{Math.round(max * p / 100) * 100}</text>
          </g>
        ))}
        <path d={areaView} fill="oklch(0.92 0.02 60)" opacity={0.5} />
        <path d={pathView} stroke="var(--fg)" strokeWidth="2" fill="none" />
        <path d={pathRead} stroke="var(--accent)" strokeWidth="2" fill="none" />
        {/* tooltip dot */}
        <g>
          <line x1={xs(18)} y1={P} x2={xs(18)} y2={H-P} stroke="var(--border-2)" strokeDasharray="2 3" />
          <circle cx={xs(18)} cy={ys(views[18])} r="4" fill="var(--fg)" stroke="white" strokeWidth="2" />
          <circle cx={xs(18)} cy={ys(reads[18])} r="4" fill="var(--accent)" stroke="white" strokeWidth="2" />
        </g>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginTop: 6, padding: '0 20px', fontFamily: 'var(--mono)' }}>
        {['19 Apr','26 Apr','3 Mei','10 Mei','18 Mei'].map(d => <span key={d}>{d}</span>)}
      </div>
    </div>
  );
}

function DashboardAnalytics() {
  const articleStats = [
    { title: 'Pembelaan Singkat untuk Basa-basi',                 views: 1820, reads: 1042, rate: 57, trend: '+12%', author: AUTHORS[2] },
    { title: 'Kita Selalu Sibuk, Tapi Jarang Benar-benar Bekerja', views: 1640, reads: 738,  rate: 45, trend: '+4%',  author: AUTHORS[1] },
    { title: 'Membaca Pelan adalah Bentuk Perlawanan',             views: 1240, reads: 695,  rate: 56, trend: '−3%',  author: AUTHORS[0] },
    { title: 'Apakah Selera Kita Masih Milik Kita?',                views: 1060, reads: 412,  rate: 39, trend: '+18%', author: AUTHORS[1] },
    { title: 'Catatan untuk Diri Sendiri: Mengapa Saya Kembali…',   views: 880,  reads: 502,  rate: 57, trend: '+6%',  author: AUTHORS[0] },
    { title: 'Dividen Tinggi Itu Bukan Tanda Saham Bagus',          views: 740,  reads: 358,  rate: 48, trend: '−1%',  author: AUTHORS[1] },
    { title: 'Ritual Pagi Itu Tidak Harus Produktif',               views: 620,  reads: 411,  rate: 66, trend: '+22%', author: AUTHORS[2] },
  ];

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="analytics" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Analytics"
          subtitle="Detail performa konten · 30 hari terakhir"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline"><Icon name="download" size={14} /> Export CSV</button>
              <button className="btn btn-outline">Bandingkan periode</button>
            </div>
          }
        />
        <div style={{ padding: 36, flex: 1 }}>
          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total views" value="48.210" delta="+12%" deltaLabel="vs 30 hari sblm" sparkline={<Sparkline />} />
            <StatCard label="Total reads" value="20.418" delta="+8,4%" deltaLabel="vs 30 hari sblm" sparkline={<Sparkline color="var(--accent)" />} />
            <StatCard label="Read rate" value="42,3%" delta="−2,1%" deltaLabel="vs 30 hari sblm" sparkline={<Sparkline color="var(--danger)" />} />
            <StatCard label="Rata-rata waktu baca" value="6m 12d" delta="+0:42" deltaLabel="vs 30 hari sblm" sparkline={<Sparkline />} />
          </div>

          {/* Chart + funnel */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
            <BigChart title="Views & Reads" subtitle="Perbandingan kunjungan vs pembacaan tuntas" />
            <div className="card" style={{ padding: 24 }}>
              <div className="serif-title" style={{ fontSize: 18, marginBottom: 16 }}>Funnel konversi</div>
              {[
                ['Visitor unik',         12480, 100,  'var(--surface-2)'],
                ['Buka artikel',          6840, 55,   'var(--fg-3)'],
                ['Baca > 50%',            2920, 23,   'var(--fg-2)'],
                ['Subscribe (CTA klik)',   312,  2.5, 'var(--accent)'],
                ['Subscribe selesai',      128,  1.0, 'var(--fg)'],
              ].map(([label, n, p, c], i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--fg-2)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{n.toLocaleString('id-ID')} <span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>({p}%)</span></span>
                  </div>
                  <div style={{ height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: c, borderRadius: 4 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Articles table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="serif-title" style={{ fontSize: 18 }}>Performa per artikel</div>
                <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>Diurutkan berdasarkan views</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-outline btn-sm">Semua</button>
                <button className="btn btn-ghost btn-sm">Gratis</button>
                <button className="btn btn-ghost btn-sm">Premium</button>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Artikel</th>
                  <th>Author</th>
                  <th style={{ textAlign: 'right' }}>Views</th>
                  <th style={{ textAlign: 'right' }}>Reads</th>
                  <th style={{ textAlign: 'right' }}>Read rate</th>
                  <th style={{ textAlign: 'right' }}>Trend</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {articleStats.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 22, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>0{i + 1}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{a.title}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar size="sm" author={a.author} />
                        <span style={{ fontSize: 13 }}>{a.author.name.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>{a.views.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>{a.reads.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${a.rate}%`, background: a.rate > 50 ? 'var(--success)' : a.rate > 35 ? 'var(--accent)' : 'var(--fg-3)' }}></div>
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, minWidth: 36, textAlign: 'right' }}>{a.rate}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, color: a.trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{a.trend}</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm"><Icon name="chevron" size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardAnalytics = DashboardAnalytics;
