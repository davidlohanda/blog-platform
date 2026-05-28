/* Article Editor — full-screen, distraction-free */

function EditorToolbar() {
  const tools = [
    ['bold', 'Tebal'],
    ['italic', 'Miring'],
    ['link', 'Tautan'],
    null,
    ['h1', 'Heading 1'],
    ['h2', 'Heading 2'],
    ['quote', 'Kutipan'],
    null,
    ['list', 'Daftar'],
    ['image', 'Gambar'],
  ];
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -120%)', background: 'var(--fg)', color: 'var(--bg)', borderRadius: 10, padding: 4, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 'var(--shadow-3)', zIndex: 10 }}>
      {tools.map((t, i) => t === null
        ? <div key={i} style={{ width: 1, height: 18, background: 'rgba(241,236,224,.18)', margin: '0 4px' }}></div>
        : <button key={i} title={t[1]} style={{ background: 'transparent', color: 'inherit', border: 'none', padding: '7px 9px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Icon name={t[0]} size={15} />
          </button>
      )}
    </div>
  );
}

function ArticleEditor() {
  const [showSettings, setShowSettings] = React.useState(true);
  const [visibility, setVisibility] = React.useState('premium');

  return (
    <div className="dash-page" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Editor topbar — minimal */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', gap: 16 }}>
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--fg-2)', textDecoration: 'none' }}>
          <Icon name="arrowLeft" size={14} /> Artikel
        </a>
        <div style={{ height: 20, width: 1, background: 'var(--border)' }}></div>
        <div style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }}></span>
            Tersimpan otomatis · 2 detik lalu
          </span>
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>1.247 kata · 5 mnt baca</div>
        <button className="btn btn-ghost btn-sm"><Icon name="eye" size={13} /> Preview</button>
        <button className={`btn btn-sm ${showSettings ? 'btn-outline' : 'btn-ghost'}`} onClick={() => setShowSettings(!showSettings)}><Icon name="settings" size={13} /> Pengaturan</button>
        <button className="btn btn-primary btn-sm">Terbitkan</button>
      </div>

      {/* Main editor area */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 32px 120px', position: 'relative' }}>
            {/* Cover image slot */}
            <div className="placeholder-img" style={{ height: 280, marginBottom: 36, cursor: 'pointer' }} data-caption="klik untuk unggah gambar sampul"></div>

            {/* Tag input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Tag>Kebiasaan</Tag>
              <button style={{ background: 'transparent', border: '1px dashed var(--border-2)', color: 'var(--fg-3)', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                <Icon name="plus" size={11} /> Tambah tag
              </button>
            </div>

            {/* Title */}
            <div contentEditable suppressContentEditableWarning
              style={{ outline: 'none', fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--fg)', marginBottom: 14 }}>
              Kita Selalu Sibuk, Tapi Jarang Benar-benar Bekerja
            </div>

            {/* Subtitle */}
            <div contentEditable suppressContentEditableWarning
              style={{ outline: 'none', fontFamily: 'var(--serif)', fontSize: 21, color: 'var(--fg-2)', lineHeight: 1.5, fontWeight: 400, marginBottom: 32 }}>
              Notifikasi, rapat singkat, balasan cepat. Hari berlalu produktif di permukaan, tapi tak satu pun pekerjaan yang penting selesai. Apa yang sebenarnya terjadi?
            </div>

            {/* Body */}
            <div className="prose" style={{ position: 'relative' }}>
              <p>Saya menulis ini dari sebuah hari yang, di kalender saya, terlihat sangat produktif. Empat belas rapat singkat, dua puluh tiga balasan email, sembilan komentar di dokumen kolaborasi. Namun ketika saya menutup laptop pukul tujuh malam, tidak ada satu pun pekerjaan yang sebenarnya saya banggakan dari hari itu.</p>
              <p>Pertanyaan yang menggangu malam itu: <strong>apa bedanya sibuk dengan bekerja?</strong></p>
              <h2>Dua macam pekerjaan</h2>
              <p>Cal Newport pernah membedakan antara <em>shallow work</em> dan <em>deep work</em>. Saya menemukan pembagian itu berguna tapi tidak cukup tajam. Sehari-hari, saya merasakan tiga lapis: <span style={{ background: 'oklch(0.93 0.13 95)', padding: '0 2px', borderRadius: 2 }}>respons reaktif, koordinasi, dan pembuatan</span>. Yang pertama paling cepat memberi rasa selesai. Yang ketiga paling lambat — tapi yang ketiga itulah yang akhirnya kita kenang sebagai pekerjaan kita.</p>
              <div style={{ position: 'relative', padding: '4px 0' }}>
                <span style={{ position: 'absolute', left: -40, top: 12, width: 30, height: 22, background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                  <Icon name="comment" size={11} /> 2
                </span>
                <p style={{ background: 'oklch(0.96 0.04 75)', padding: '6px 10px', borderRadius: 4, margin: '0 -10px 1.3em' }}>Masalahnya, hampir semua sistem kerja modern dirancang untuk memberi reward pada lapis pertama. <strong>Notifikasi, status “online”, balasan cepat di Slack</strong> — semua mengukur visibilitas, bukan kontribusi.</p>
              </div>
              <p>Selama bertahun-tahun saya menukar kemampuan untuk fokus dengan ilusi keterhubungan. Setiap kali saya memeriksa Slack di antara dua paragraf, saya sebenarnya sedang berkata pada diri saya sendiri: <em>“saya ada, saya bisa dihubungi, saya berguna.”</em></p>
              <p>Tapi saya tidak menulis. Saya tidak memikirkan. Saya tidak <strong>membuat</strong> apapun.</p>
              <h2>Tanda-tanda yang gampang dilewatkan</h2>
              <p>Beberapa minggu terakhir saya mencoba menjawab pertanyaan sederhana di akhir hari: <em>apa satu hal yang hanya saya yang bisa kerjakan hari ini, dan apa saya benar-benar mengerjakannya?</em></p>
            </div>

            {/* Floating toolbar (illustrative) */}
            <EditorToolbar />

            {/* Block-add prompt */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 0', color: 'var(--fg-4)', fontFamily: 'var(--serif)', fontSize: 19, fontStyle: 'italic' }}>
              <button style={{ width: 26, height: 26, borderRadius: 13, border: '1px solid var(--border-2)', background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={13} />
              </button>
              <span>Tekan / untuk perintah, atau lanjutkan menulis…</span>
            </div>
          </div>
        </div>

        {/* Settings drawer */}
        {showSettings && (
          <aside style={{ width: 340, borderLeft: '1px solid var(--border)', background: 'var(--bg)', overflow: 'auto', flexShrink: 0 }}>
            <div style={{ padding: 24 }}>
              <div className="serif-title" style={{ fontSize: 18, marginBottom: 4 }}>Pengaturan terbit</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginBottom: 24 }}>Tersimpan otomatis bersama draft</div>

              {/* Visibility */}
              <div style={{ marginBottom: 24 }}>
                <div className="label">Visibility</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {[
                    ['free', 'Gratis', 'Bisa dibaca semua pengunjung'],
                    ['premium', 'Khusus member', 'Preview 200 kata, lalu paywall'],
                  ].map(([v, t, d]) => (
                    <label key={v} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 8, border: visibility === v ? '1.5px solid var(--fg)' : '1px solid var(--border)', cursor: 'pointer' }}>
                      <input type="radio" checked={visibility === v} onChange={() => setVisibility(v)} style={{ accentColor: 'var(--fg)', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{d}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div style={{ marginBottom: 24 }}>
                <div className="label">Excerpt untuk preview paywall</div>
                <textarea className="input" style={{ height: 88, padding: 12, lineHeight: 1.5, resize: 'none' }} defaultValue="Notifikasi, rapat singkat, balasan cepat. Hari berlalu produktif di permukaan, tapi tak satu pun pekerjaan yang penting selesai. Apa yang sebenarnya terjadi?"></textarea>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 6 }}>147 / 200 karakter</div>
              </div>

              {/* Schedule */}
              <div style={{ marginBottom: 24 }}>
                <div className="label">Jadwalkan</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="input" type="text" defaultValue="25 Mei 2026" />
                  <input className="input" type="text" defaultValue="07:00" />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 6 }}>Akan terbit Sabtu pagi · Email otomatis ke 8.420 pelanggan</div>
              </div>

              {/* Series */}
              <div style={{ marginBottom: 24 }}>
                <div className="label">Series</div>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>Belum ditambahkan ke series</span>
                  <Icon name="chevron" size={13} />
                </button>
              </div>

              {/* SEO */}
              <div>
                <div className="label">Slug URL</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 12.5, padding: '8px 12px', background: 'var(--surface)', borderRadius: 6, color: 'var(--fg-3)' }}>
                  <span>lentera.id/</span>
                  <span style={{ color: 'var(--fg)' }}>kita-selalu-sibuk</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

window.ArticleEditor = ArticleEditor;
