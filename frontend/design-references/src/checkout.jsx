/* Subscribe & Checkout */

const PLANS = [
  { id: '1m',  label: '1 Bulan',   price: 39000,  per: 'per bulan',  total: 39000,  best: false },
  { id: '3m',  label: '3 Bulan',   price: 35000,  per: 'per bulan',  total: 105000, save: '10%', best: false },
  { id: '6m',  label: '6 Bulan',   price: 32000,  per: 'per bulan',  total: 192000, save: '18%', best: true },
  { id: '12m', label: '12 Bulan',  price: 28000,  per: 'per bulan',  total: 336000, save: '28%', best: false },
];

const fmtRp = (n) => 'Rp ' + n.toLocaleString('id-ID');

function PlanCard({ plan, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: '20px 22px',
        borderRadius: 12,
        border: selected ? '2px solid var(--fg)' : '1px solid var(--border-2)',
        background: 'var(--bg-elev)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all .15s',
        fontFamily: 'inherit',
      }}>
      {plan.best && (
        <span style={{ position: 'absolute', top: -10, right: 18, background: 'var(--accent)', color: 'white', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 999 }}>
          PALING POPULER
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${selected ? 'var(--fg)' : 'var(--border-2)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: selected ? 'var(--fg)' : 'transparent' }}>
            {selected && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--bg)' }}></span>}
          </span>
          <span className="serif-title" style={{ fontSize: 19 }}>{plan.label}</span>
          {plan.save && <span className="badge badge-accent">Hemat {plan.save}</span>}
        </div>
      </div>
      <div style={{ paddingLeft: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmtRp(plan.price)}</span>
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{plan.per}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>
          Dibayar di muka {fmtRp(plan.total)}
        </div>
      </div>
    </button>
  );
}

function CheckoutPage() {
  const [selected, setSelected] = React.useState('6m');
  const [method, setMethod] = React.useState('gopay');
  const plan = PLANS.find(p => p.id === selected);

  const methods = [
    { id: 'gopay',    label: 'GoPay',           note: 'E-wallet · Saldo: Rp 250.000' },
    { id: 'qris',     label: 'QRIS',            note: 'Scan dengan e-wallet apapun' },
    { id: 'va-bca',   label: 'Virtual Account', note: 'BCA, BNI, BRI, Mandiri' },
    { id: 'card',     label: 'Kartu Kredit/Debit', note: 'Visa, Mastercard' },
  ];

  return (
    <div className="pub-page scroll-y">
      <TopBar showCta={false} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 56px' }}>
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--fg-2)', textDecoration: 'none', marginBottom: 24 }}>
          <Icon name="arrowLeft" size={14} /> Kembali ke beranda
        </a>
        <div style={{ marginBottom: 36, maxWidth: 640 }}>
          <h1 className="serif-title" style={{ fontSize: 40, margin: '0 0 12px', letterSpacing: '-0.025em' }}>
            Berlangganan Lentera
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.6, fontFamily: 'var(--serif)', margin: 0 }}>
            Pilih durasi yang paling cocok. Kamu bisa berhenti kapan saja, tanpa pertanyaan basa-basi.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'flex-start' }}>
          {/* Left — selection */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              1 · Pilih paket
            </div>
            <div style={{ display: 'grid', gap: 12, marginBottom: 40 }}>
              {PLANS.map(p => (
                <PlanCard key={p.id} plan={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />
              ))}
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              2 · Pilih metode pembayaran
            </div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 32 }}>
              {methods.map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 8, border: method === m.id ? '1.5px solid var(--fg)' : '1px solid var(--border-2)', background: 'var(--bg-elev)', cursor: 'pointer' }}>
                  <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} style={{ accentColor: 'var(--fg)' }} />
                  <div className="placeholder-img" style={{ width: 44, height: 28, flexShrink: 0 }} data-caption=""></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{m.note}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Right — summary */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 className="serif-title" style={{ fontSize: 18, margin: '0 0 18px' }}>Ringkasan</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                <span style={{ color: 'var(--fg-2)' }}>Paket {plan.label}</span>
                <span>{fmtRp(plan.total)}</span>
              </div>
              {plan.save && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10, color: 'var(--accent-ink)' }}>
                  <span>Hemat {plan.save}</span>
                  <span>−{fmtRp(PLANS[0].price * (parseInt(plan.id) || 1) - plan.total)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 16, color: 'var(--fg-2)' }}>
                <span>PPN 11%</span>
                <span>Termasuk</span>
              </div>
              <hr className="divider" style={{ margin: '4px 0 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Total dibayar</span>
                <span className="serif-title" style={{ fontSize: 26 }}>{fmtRp(plan.total)}</span>
              </div>

              <button className="btn btn-accent btn-lg" style={{ width: '100%', marginBottom: 12 }}>
                Lanjutkan ke pembayaran <Icon name="arrow" />
              </button>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', lineHeight: 1.5 }}>
                Dengan melanjutkan, kamu menyetujui <a href="#" style={{ color: 'var(--fg-2)' }}>Ketentuan</a> & <a href="#" style={{ color: 'var(--fg-2)' }}>Kebijakan Privasi</a>
              </div>

              <hr className="divider" style={{ margin: '20px 0' }} />
              <div style={{ display: 'grid', gap: 10, fontSize: 13, color: 'var(--fg-2)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" color="var(--success)" /> <span>Akses penuh ke 142 tulisan</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" color="var(--success)" /> <span>Esai baru tiap Sabtu pagi</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" color="var(--success)" /> <span>Komentar & diskusi member</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" color="var(--success)" /> <span>Batalkan kapan saja</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: '16px 18px', background: 'var(--surface)', borderRadius: 10, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--fg)' }}>Akses langsung setelah bayar.</strong> Kamu akan dialihkan kembali ke tulisan yang sedang kamu baca. Bisa berhenti berlangganan kapan saja dari Pengaturan.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CheckoutPage = CheckoutPage;
