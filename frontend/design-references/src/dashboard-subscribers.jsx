/* Dashboard — Subscribers list */

function DashboardSubscribers() {
  const subs = [
    { name: 'Rina Astari',       email: 'rina@email.com',          plan: '6 Bulan',  since: '15 Agu 2024', renews: '15 Agu 2026', status: 'active',  spend: 552 },
    { name: 'Fadli Hakim',       email: 'fadli.h@gmail.com',       plan: '12 Bulan', since: '3 Mar 2025',  renews: '3 Mar 2026',  status: 'active',  spend: 336 },
    { name: 'Maya Larasati',     email: 'maya.lr@yahoo.com',       plan: '1 Bulan',  since: '12 Mei 2026', renews: '12 Jun 2026', status: 'active',  spend: 39 },
    { name: 'Bagas Pratama',     email: 'bagasp@me.com',           plan: '6 Bulan',  since: '8 Feb 2026',  renews: '8 Agu 2026',  status: 'active',  spend: 192 },
    { name: 'Indah Permatasari', email: 'indahperma@outlook.com',  plan: '3 Bulan',  since: '20 Apr 2025', renews: '20 Jul 2025', status: 'expired', spend: 525 },
    { name: 'Hendra Wijaya',     email: 'hendrawij@gmail.com',     plan: '12 Bulan', since: '1 Jan 2026',  renews: '1 Jan 2027',  status: 'active',  spend: 336 },
    { name: 'Putri Anggraini',   email: 'putri.a@email.com',       plan: '6 Bulan',  since: '14 Feb 2026', renews: '14 Agu 2026', status: 'active',  spend: 192 },
    { name: 'Reza Mahendra',     email: 'rezamhd@protonmail.com',  plan: '1 Bulan',  since: '17 Mei 2026', renews: '17 Jun 2026', status: 'paused',  spend: 78 },
    { name: 'Anggita Sari',      email: 'anggitas@gmail.com',      plan: '6 Bulan',  since: '22 Nov 2025', renews: '22 Mei 2026', status: 'expiring', spend: 384 },
    { name: 'Daniel Putranto',   email: 'danielputr@outlook.com',  plan: '12 Bulan', since: '5 Jun 2025',  renews: '5 Jun 2026',  status: 'expiring', spend: 336 },
  ];

  const statusBadge = (s) => {
    if (s === 'active')   return <span className="badge badge-success badge-dot">Aktif</span>;
    if (s === 'expiring') return <span className="badge badge-accent badge-dot">Berakhir &lt; 14 hari</span>;
    if (s === 'paused')   return <span className="badge badge-soft">Dijeda</span>;
    if (s === 'expired')  return <span className="badge badge-soft" style={{ color: 'var(--fg-3)' }}>Berakhir</span>;
  };

  return (
    <div className="dash-page" style={{ display: 'flex' }}>
      <DashSidebar active="subscribers" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <DashTopBar
          title="Subscriber"
          subtitle="8.420 aktif · 64 baru bulan ini · 28 akan berakhir minggu depan"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline"><Icon name="download" size={14} /> Export CSV</button>
              <button className="btn btn-primary"><Icon name="plus" size={14} /> Undang manual</button>
            </div>
          }
        />
        <div style={{ padding: 36, flex: 1 }}>
          {/* Stat overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total aktif"           value="8.420"        delta="+128"   deltaLabel="bulan ini"        sparkline={<Sparkline />} />
            <StatCard label="MRR"                   value="Rp 32,4 jt"   delta="+4,2%"  deltaLabel="MoM"              sparkline={<Sparkline color="var(--accent)" />} />
            <StatCard label="Churn (30 hari)"       value="2,1%"          delta="−0,3%"  deltaLabel="vs 30 hari sblm" sparkline={<Sparkline color="var(--success)" />} />
            <StatCard label="LTV rata-rata"         value="Rp 412rb"      delta="+18rb"  deltaLabel="vs Q1 2026"      sparkline={<Sparkline />} />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <input className="input" placeholder="Cari nama atau email…" style={{ paddingLeft: 36 }} />
              <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--fg-3)' }}><Icon name="search" size={14} /></span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                ['Semua', 8420, true],
                ['Aktif', 7980, false],
                ['Akan berakhir', 28, false],
                ['Dijeda', 142, false],
                ['Expired', 270, false],
              ].map(([label, count, active]) => (
                <button key={label} className={`btn btn-sm ${active ? 'btn-outline' : 'btn-ghost'}`}>
                  {label} <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-3)', marginLeft: 6 }}>{count.toLocaleString('id-ID')}</span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn-outline btn-sm"><Icon name="filter" size={13} /> Paket</button>
            <button className="btn btn-outline btn-sm"><Icon name="filter" size={13} /> Periode</button>
          </div>

          {/* Bulk action bar (when selection) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--surface-2)', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>3 dipilih</span>
            <div style={{ width: 1, height: 18, background: 'var(--border-2)' }}></div>
            <button className="btn btn-ghost btn-sm" style={{ height: 28 }}>Kirim email</button>
            <button className="btn btn-ghost btn-sm" style={{ height: 28 }}>Tambah tag</button>
            <button className="btn btn-ghost btn-sm" style={{ height: 28 }}>Export terpilih</button>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn-ghost btn-sm" style={{ height: 28, color: 'var(--fg-3)' }}>Hapus pilihan</button>
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}><input type="checkbox" style={{ accentColor: 'var(--fg)' }} /></th>
                  <th>Member</th>
                  <th>Paket</th>
                  <th>Sejak</th>
                  <th>Tagihan berikut</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Total spend</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s, i) => (
                  <tr key={i}>
                    <td><input type="checkbox" defaultChecked={i < 3} style={{ accentColor: 'var(--fg)' }} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar size="sm" author={{ id: s.email, initials: s.name.split(' ').map(n => n[0]).join('').slice(0, 2) }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-soft" style={{ fontFamily: 'var(--sans)', fontWeight: 500 }}>{s.plan}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>{s.since}</td>
                    <td style={{ fontSize: 13, color: 'var(--fg-2)' }}>{s.renews}</td>
                    <td>{statusBadge(s.status)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>Rp {s.spend.toLocaleString('id-ID')}rb</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm"><Icon name="menu" size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 13, color: 'var(--fg-3)' }}>
            <span>Menampilkan 1–10 dari 8.420 subscriber</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button className="btn btn-outline btn-sm" disabled style={{ opacity: .4 }}><Icon name="arrowLeft" size={12} /></button>
              <button className="btn btn-outline btn-icon btn-sm" style={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}>1</button>
              <button className="btn btn-ghost btn-icon btn-sm">2</button>
              <button className="btn btn-ghost btn-icon btn-sm">3</button>
              <span style={{ padding: '0 4px' }}>…</span>
              <button className="btn btn-ghost btn-icon btn-sm">843</button>
              <button className="btn btn-outline btn-sm">Berikutnya <Icon name="arrow" size={12} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardSubscribers = DashboardSubscribers;
