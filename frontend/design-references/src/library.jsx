/* Personal Library — member-facing */

const FOLDERS = [
  { id: 'untuk-dibaca-ulang', name: 'Untuk dibaca ulang', count: 12, color: 60 },
  { id: 'tentang-menulis',    name: 'Tentang menulis',    count: 8,  color: 200 },
  { id: 'pelan-pelan-saja',   name: 'Pelan-pelan saja',   count: 23, color: 130 },
  { id: 'dikutip',            name: 'Sering dikutip',     count: 5,  color: 320 },
];

function FolderTile({ folder, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '16px 18px',
        borderRadius: 10,
        background: active ? 'var(--surface-2)' : 'var(--bg-elev)',
        border: active ? '1px solid var(--border-2)' : '1px solid var(--border)',
        cursor: 'pointer',
        width: '100%',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `oklch(0.92 0.06 ${folder.color})`, color: `oklch(0.42 0.12 ${folder.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="folder" size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{folder.count} tulisan</div>
      </div>
    </button>
  );
}

function LibraryArticleRow({ article, savedDate, folder }) {
  return (
    <a href="#" style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 20, padding: '20px 0', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
      <div className="placeholder-img" style={{ height: 80 }} data-caption={article.image}></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <Tag>{article.tag}</Tag>
          {article.premium && <PremiumBadge />}
          {folder && <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>· di <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{folder}</span></span>}
        </div>
        <h3 className="serif-title" style={{ fontSize: 19, margin: '0 0 6px' }}>{article.title}</h3>
        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-3)' }}>
          <Avatar size="sm" author={article.author} />
          <span>{article.author.name}</span>
          <span>·</span>
          <span>{article.readTime} mnt</span>
          <span>·</span>
          <span>Disimpan {savedDate}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="btn btn-ghost btn-icon btn-sm" title="Pindah folder"><Icon name="folder" size={14} /></button>
        <button className="btn btn-ghost btn-icon btn-sm" title="Hapus"><Icon name="bookmark" size={14} color="var(--accent-ink)" /></button>
      </div>
    </a>
  );
}

function PersonalLibrary() {
  const [activeFolder, setActiveFolder] = React.useState(null);

  return (
    <div className="pub-page scroll-y">
      <TopBar isMember />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 32px 64px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Library</div>
            <h1 className="serif-title" style={{ fontSize: 40, margin: 0, letterSpacing: '-0.025em' }}>Tulisan yang kamu simpan</h1>
            <p style={{ fontSize: 15, color: 'var(--fg-2)', margin: '8px 0 0' }}>48 tulisan tersimpan · 4 folder</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <input className="input" placeholder="Cari di library…" style={{ width: 260, paddingLeft: 36 }} />
              <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--fg-3)' }}><Icon name="search" size={14} /></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 36, alignItems: 'flex-start' }}>
          {/* Sidebar — folders */}
          <aside>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, padding: '0 4px' }}>
              Folder
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <button onClick={() => setActiveFolder(null)}
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: activeFolder === null ? 'var(--surface-2)' : 'var(--bg-elev)',
                  border: activeFolder === null ? '1px solid var(--border-2)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--fg)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="bookmark" size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Semua tersimpan</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>48 tulisan</div>
                </div>
              </button>
              {FOLDERS.map(f => (
                <FolderTile key={f.id} folder={f} active={activeFolder === f.id} onClick={() => setActiveFolder(f.id)} />
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'flex-start' }}>
              <Icon name="plus" size={13} /> Buat folder baru
            </button>

            <hr className="divider" style={{ margin: '24px 0' }} />

            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, padding: '0 4px' }}>
              Filter cepat
            </div>
            <div style={{ display: 'grid', gap: 2 }}>
              {['Belum dibaca', 'Sudah selesai', 'Khusus member', 'Dari series'].map((f) => (
                <button key={f} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>{f}</button>
              ))}
            </div>
          </aside>

          {/* Main column */}
          <main>
            {/* Folder header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="serif-title" style={{ fontSize: 24, margin: '0 0 4px' }}>
                  {activeFolder ? FOLDERS.find(f => f.id === activeFolder).name : 'Semua tersimpan'}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                  {activeFolder
                    ? `${FOLDERS.find(f => f.id === activeFolder).count} tulisan dalam folder ini`
                    : '48 tulisan dari semua folder'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Urutkan:</span>
                <button className="btn btn-outline btn-sm">Terbaru disimpan <Icon name="chevronDown" size={12} /></button>
                <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }}></div>
                <button className="btn btn-outline btn-icon btn-sm"><Icon name="list" size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm"><Icon name="grid" size={14} /></button>
              </div>
            </div>

            {/* Article list */}
            <div>
              <LibraryArticleRow article={ARTICLES[0]} savedDate="kemarin"     folder="Untuk dibaca ulang" />
              <LibraryArticleRow article={ARTICLES[2]} savedDate="3 hari lalu" folder="Tentang menulis" />
              <LibraryArticleRow article={ARTICLES[1]} savedDate="1 minggu lalu" folder="Pelan-pelan saja" />
              <LibraryArticleRow article={ARTICLES[3]} savedDate="2 minggu lalu" folder="Tentang menulis" />
              <LibraryArticleRow article={ARTICLES[5]} savedDate="3 minggu lalu" folder="Untuk dibaca ulang" />
              <LibraryArticleRow article={ARTICLES[4]} savedDate="1 bulan lalu" folder="Pelan-pelan saja" />
            </div>

            {/* Empty state hint at bottom */}
            <div style={{ marginTop: 32, padding: 28, background: 'var(--surface)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                Tip: simpan tulisan ke folder yang sama selama satu minggu — di akhir minggu, kamu akan punya kumpulan tematik yang siap dibaca ulang di akhir pekan.
              </div>
            </div>
          </main>
        </div>
      </div>

      <PubFooter />
    </div>
  );
}

window.PersonalLibrary = PersonalLibrary;
