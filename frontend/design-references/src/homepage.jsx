/* Publication Homepage */

function HomeHero() {
  return (
    <section style={{ padding: '72px 32px 56px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 22 }}>
          Esai Mingguan · Sejak 2023
        </div>
        <h1 className="serif-title" style={{ fontSize: 64, margin: '0 0 24px', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          Tulisan-tulisan pelan<br />untuk masa yang terburu-buru.
        </h1>
        <p style={{ fontSize: 19, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto 32px', fontFamily: 'var(--serif)' }}>
          {PUB.name} adalah surat berkala tentang ide, buku, dan cara berpikir — ditulis bergantian oleh tiga penulis yang sama-sama percaya bahwa pelan bukan berarti tertinggal.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 18 }}>
          <button className="btn btn-accent btn-lg">Berlangganan — Rp 39.000/bln</button>
          <button className="btn btn-outline btn-lg">Baca dulu, gratis</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: 'var(--fg-3)' }}>
          <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>{PUB.subscribers.toLocaleString('id-ID')}</strong> pelanggan</span>
          <span>·</span>
          <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>{PUB.articles}</strong> tulisan</span>
          <span>·</span>
          <span><strong style={{ color: 'var(--fg)', fontWeight: 600 }}>3</strong> penulis</span>
        </div>
      </div>
    </section>
  );
}

function HomeFeatured() {
  return (
    <section style={{ padding: '64px 32px 24px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
        <h2 className="serif-title" style={{ fontSize: 28, margin: 0 }}>Pilihan minggu ini</h2>
        <a href="#" style={{ fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none' }}>Semua tulisan <Icon name="arrow" size={13} /></a>
      </div>
      <ArticleCard article={ARTICLES[0]} featured />
    </section>
  );
}

function HomeGrid() {
  const items = ARTICLES.slice(1, 5);
  return (
    <section style={{ padding: '24px 32px 48px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
        {items.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </section>
  );
}

function HomeAuthors() {
  return (
    <section style={{ padding: '48px 32px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>Para penulis</div>
          <h2 className="serif-title" style={{ fontSize: 32, margin: '0 0 10px' }}>Tiga suara, satu meja redaksi.</h2>
          <p style={{ fontSize: 15.5, color: 'var(--fg-2)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            Setiap minggu, satu dari tiga penulis menulis surat panjang. Kamu bisa ikuti masing-masing atau membaca semuanya sekaligus.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {AUTHORS.map(a => (
            <div key={a.id} className="card" style={{ padding: 24, background: 'var(--bg-elev)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                <Avatar size="lg" author={a} />
                <div>
                  <div className="serif-title" style={{ fontSize: 19, lineHeight: 1.1 }}>{a.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>{a.role}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 14px' }}>{a.bio}</p>
              <a href="#" style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 500, textDecoration: 'none' }}>Baca tulisannya <Icon name="arrow" size={12} /></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeMore() {
  const items = ARTICLES.slice(5, 7);
  return (
    <section style={{ padding: '56px 32px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
        <h2 className="serif-title" style={{ fontSize: 28, margin: 0 }}>Sebelumnya</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Semua', 'Esai', 'Kebiasaan', 'Teknologi', 'Filsafat'].map((t, i) => (
            <button key={t} className={`btn btn-sm ${i === 0 ? 'btn-outline' : 'btn-ghost'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((a, i) => (
          <a key={a.id} href="#" style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 32, padding: '24px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Tag>{a.tag}</Tag>
                {a.premium && <PremiumBadge />}
              </div>
              <h3 className="serif-title" style={{ fontSize: 24, margin: '0 0 8px' }}>{a.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 14px' }}>{a.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-3)' }}>
                <Avatar size="sm" author={a.author} />
                <span style={{ color: 'var(--fg-2)' }}>{a.author.name}</span>
                <span>·</span>
                <span>{a.date}</span>
                <span>·</span>
                <span>{a.readTime} mnt</span>
              </div>
            </div>
            <div className="placeholder-img" style={{ height: 140 }} data-caption={a.image}></div>
          </a>
        ))}
      </div>
    </section>
  );
}

function HomeSubscribeBand() {
  return (
    <section style={{ padding: '60px 32px', background: 'var(--fg)', color: 'var(--bg)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="serif-title" style={{ fontSize: 36, margin: '0 0 16px', color: 'var(--bg)' }}>
          Surat berikutnya tayang Sabtu pagi.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, opacity: .75, margin: '0 0 28px' }}>
          Langganan untuk membaca seluruh tulisan, atau masukkan email kamu untuk preview gratis setiap pekan.
        </p>
        <form style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto' }}>
          <input className="input" placeholder="alamat@email.com" style={{ background: 'transparent', borderColor: 'rgba(241,236,224,.25)', color: 'var(--bg)' }} />
          <button className="btn btn-accent">Berlangganan</button>
        </form>
        <div style={{ fontSize: 12.5, opacity: .55, marginTop: 14 }}>
          Batalkan kapan saja · Tanpa iklan
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="pub-page scroll-y">
      <TopBar active="home" />
      <HomeHero />
      <HomeFeatured />
      <HomeGrid />
      <HomeAuthors />
      <HomeMore />
      <HomeSubscribeBand />
      <PubFooter />
    </div>
  );
}

window.HomePage = HomePage;
