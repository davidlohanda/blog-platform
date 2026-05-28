/* Auth pages — Login, Register, Forgot password */

function AuthShell({ children, title, subtitle, footer }) {
  return (
    <div className="pub-page scroll-y" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
      {/* Left — brand panel */}
      <div style={{ background: 'var(--surface)', padding: '48px 56px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        <Logo />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 18 }}>
            Catatan dari penulis
          </div>
          <blockquote className="serif-title" style={{ fontSize: 28, lineHeight: 1.35, margin: 0, fontWeight: 500, color: 'var(--fg)', fontStyle: 'italic' }}>
            “Kami tidak menulis untuk mengalahkan algoritma. Kami menulis untuk dibaca dengan teliti oleh seseorang yang juga sedang minum kopi.”
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22 }}>
            <Avatar author={AUTHORS[0]} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{AUTHORS[0].name}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Co-founder · {PUB.name}</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
          © 2026 Lentera · Esai mingguan
        </div>
      </div>

      {/* Right — form */}
      <div style={{ padding: '64px 64px 32px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="serif-title" style={{ fontSize: 32, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 15, color: 'var(--fg-2)', margin: '0 0 28px', lineHeight: 1.55 }}>{subtitle}</p>}
          {children}
        </div>
        {footer && (
          <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--fg-2)', marginTop: 32 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleButton({ label }) {
  return (
    <button className="btn btn-outline" style={{ width: '100%', height: 44 }}>
      <Icon name="google" size={18} /> {label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--fg-3)', fontSize: 12.5, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span>atau</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

function LoginPage() {
  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk untuk lanjut membaca dari titik terakhir kamu."
      footer={<>Belum punya akun? <a href="#" style={{ color: 'var(--accent-ink)', fontWeight: 500, textDecoration: 'none' }}>Daftar gratis</a></>}
    >
      <GoogleButton label="Lanjutkan dengan Google" />
      <Divider />
      <form style={{ display: 'grid', gap: 14 }}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" defaultValue="rina@email.com" />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="label">Kata sandi</label>
            <a href="#" style={{ fontSize: 12.5, color: 'var(--fg-2)', textDecoration: 'none' }}>Lupa sandi?</a>
          </div>
          <input className="input" type="password" defaultValue="••••••••••" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--fg-2)', marginTop: 2 }}>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--fg)' }} /> Tetap masuk di perangkat ini
        </label>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 6 }}>Masuk</button>
      </form>
    </AuthShell>
  );
}

function RegisterPage() {
  return (
    <AuthShell
      title="Buat akun Lentera"
      subtitle="Gratis untuk membaca artikel free dan menyimpan ke library kamu sendiri."
      footer={<>Sudah punya akun? <a href="#" style={{ color: 'var(--accent-ink)', fontWeight: 500, textDecoration: 'none' }}>Masuk</a></>}
    >
      <GoogleButton label="Daftar dengan Google" />
      <Divider />
      <form style={{ display: 'grid', gap: 14 }}>
        <div>
          <label className="label">Nama lengkap</label>
          <input className="input" type="text" placeholder="Mis. Rina Astari" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="nama@email.com" />
        </div>
        <div>
          <label className="label">Kata sandi</label>
          <input className="input" type="password" placeholder="Minimal 8 karakter" />
          <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 6 }}>Kombinasi huruf dan angka lebih disarankan.</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--fg-2)', marginTop: 4, lineHeight: 1.5 }}>
          <input type="checkbox" style={{ accentColor: 'var(--fg)', marginTop: 3 }} />
          <span>Saya menyetujui <a href="#" style={{ color: 'var(--accent-ink)' }}>Ketentuan</a> dan <a href="#" style={{ color: 'var(--accent-ink)' }}>Kebijakan Privasi</a> Lentera.</span>
        </label>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 6 }}>Buat akun</button>
      </form>
    </AuthShell>
  );
}

function ForgotPage() {
  const [sent, setSent] = React.useState(false);
  return (
    <AuthShell
      title={sent ? "Cek inbox kamu" : "Lupa kata sandi"}
      subtitle={sent
        ? "Kami sudah kirim tautan reset ke alamat email kamu. Tautan berlaku selama 30 menit."
        : "Masukkan email kamu, kami akan kirim tautan untuk membuat kata sandi baru."
      }
      footer={<><a href="#" style={{ color: 'var(--fg-2)', textDecoration: 'none' }}><Icon name="arrowLeft" size={13} /> Kembali ke halaman masuk</a></>}
    >
      {sent ? (
        <div className="card" style={{ padding: 24, background: 'var(--surface)', border: 'none' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" color="var(--success)" />
            </div>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.55 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Email terkirim ke rina@email.com</div>
              <div style={{ color: 'var(--fg-2)' }}>Tidak menerima? Tunggu 1 menit lalu coba kirim ulang. Cek folder spam jika perlu.</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setSent(false)}>Kirim ulang tautan</button>
        </div>
      ) : (
        <form style={{ display: 'grid', gap: 14 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div>
            <label className="label">Email terdaftar</label>
            <input className="input" type="email" placeholder="nama@email.com" />
          </div>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 6 }}>Kirim tautan reset</button>
        </form>
      )}
    </AuthShell>
  );
}

window.LoginPage = LoginPage;
window.RegisterPage = RegisterPage;
window.ForgotPage = ForgotPage;
