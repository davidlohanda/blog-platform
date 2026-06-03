import {
  PrismaClient,
  AuthorRole,
  ArticleStatus,
  Visibility,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// ─── Tiptap JSON builders ────────────────────────────────────────────────────
type TiptapNode = Record<string, unknown>;

function p(...texts: (string | TiptapNode)[]): TiptapNode {
  const content = texts.map((t) =>
    typeof t === 'string' ? { type: 'text', text: t } : t,
  );
  return { type: 'paragraph', content };
}

function h2(text: string): TiptapNode {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] };
}

function h3(text: string): TiptapNode {
  return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] };
}

function bold(text: string): TiptapNode {
  return { type: 'text', text, marks: [{ type: 'bold' }] };
}

function italic(text: string): TiptapNode {
  return { type: 'text', text, marks: [{ type: 'italic' }] };
}

function li(text: string): TiptapNode {
  return { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] };
}

function ul(...items: string[]): TiptapNode {
  return { type: 'bulletList', content: items.map(li) };
}

function ol(...items: string[]): TiptapNode {
  return { type: 'orderedList', content: items.map(li) };
}

function doc(...nodes: TiptapNode[]): TiptapNode {
  return { type: 'doc', content: nodes };
}

// ─── Fixed UUIDs untuk idempotency ──────────────────────────────────────────
const ID = {
  pub: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',

  // Users
  platformOwner: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb00',
  adminUser:     'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb01',
  pubOwner:      'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb02',
  pubAdmin:      'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb03',
  author1:       'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb04',
  author2:       'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb05',
  member1:       'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb06',
  member2:       'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb07',
  member3:       'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb08',
  memberExpired: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb09',
  memberFree:    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb10',

  // Subscription plans (per-month price × durationMonths = total)
  plan1mo:  'cccccccc-cccc-4ccc-cccc-cccccccccc01',
  plan3mo:  'cccccccc-cccc-4ccc-cccc-cccccccccc03',
  plan6mo:  'cccccccc-cccc-4ccc-cccc-cccccccccc06',
  plan12mo: 'cccccccc-cccc-4ccc-cccc-cccccccccc12',

  // Tags
  tagInvestasi: 'dddddddd-dddd-4ddd-dddd-dddddddddd01',
  tagSaham:     'dddddddd-dddd-4ddd-dddd-dddddddddd02',
  tagReksaDana: 'dddddddd-dddd-4ddd-dddd-dddddddddd03',
  tagObligasi:  'dddddddd-dddd-4ddd-dddd-dddddddddd04',
  tagProperti:  'dddddddd-dddd-4ddd-dddd-dddddddddd05',
  tagPemula:    'dddddddd-dddd-4ddd-dddd-dddddddddd06',

  // Articles
  artFree1:     'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee01',
  artFree2:     'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee02',
  artFree3:     'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee03',
  artPremium1:  'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee04',
  artPremium2:  'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee05',
  artPremium3:  'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee06',
  artDraft:     'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee07',
  artScheduled: 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeee08',

  // Series
  series: 'ffffffff-ffff-4fff-ffff-ffffffffffff',
};

// ─── Unsplash cover images (finance/investment theme) ────────────────────────
const COVERS = {
  free1:     'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
  free2:     'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  free3:     'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200',
  premium1:  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200',
  premium2:  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
  premium3:  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
  draft:     'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200',
  scheduled: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200',
  series:    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200',
  pub:       'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
};

// ─── Artikel (Tiptap JSON content) ──────────────────────────────────────────
const content = {
  // FREE 1: Mulai Investasi dari Rp 100.000
  mulaiInvestasi: doc(
    p(
      'Salah satu mitos terbesar seputar investasi adalah bahwa kamu membutuhkan modal besar untuk memulai. ',
      '"Nanti saja kalau sudah punya uang lebih," begitu pikiran banyak orang. ',
      'Padahal waktu yang hilang jauh lebih mahal daripada modal yang belum cukup besar.'
    ),
    h2('Mengapa Mulai Sekarang Lebih Penting dari Mulai dengan Besar'),
    p(
      'Compound interest — bunga berbunga — bekerja paling baik ketika diberi waktu yang panjang. ',
      'Bukan ketika diberi modal yang besar. Ini fakta matematika yang tidak berubah.'
    ),
    p(
      'Bayangkan dua skenario: ',
      bold('Skenario A'),
      ' — kamu mulai investasi Rp 100.000 per bulan di usia 25. ',
      bold('Skenario B'),
      ' — kamu menunggu sampai punya Rp 500.000 per bulan di usia 35. ',
      'Dengan asumsi return 10% per tahun, di usia 55 Skenario A menghasilkan lebih dari ',
      italic('dua kali lipat'),
      ' Skenario B. Padahal total uang yang disetor Skenario A bahkan lebih kecil.'
    ),
    h2('Instrumen Investasi yang Cocok untuk Modal Kecil'),
    h3('1. Reksa Dana Pasar Uang'),
    p(
      'Ini titik awal paling ideal untuk pemula. Modal minimum bisa mulai dari Rp 10.000 di beberapa platform. ',
      'Return sekitar 4–6% per tahun (lebih tinggi dari tabungan biasa), risiko sangat rendah, ',
      'dan dana bisa dicairkan kapan saja dalam 1–2 hari kerja.'
    ),
    h3('2. Reksa Dana Pendapatan Tetap'),
    p(
      'Untuk yang ingin sedikit lebih agresif dari pasar uang. Modal awal mulai Rp 10.000–100.000. ',
      'Return historis 6–9% per tahun. Cocok sebagai tabungan jangka menengah 2–3 tahun.'
    ),
    h3('3. Saham Fraksional'),
    p(
      'Beberapa platform sekuritas sekarang mengizinkan pembelian saham dalam jumlah kecil, ',
      'bahkan hanya 1 lembar. Kamu bisa mulai berinvestasi di saham-saham blue chip ',
      'dengan modal ratusan ribu rupiah saja.'
    ),
    h2('Kalkulasi Sederhana: Rp 100.000 Menjadi Berapa?'),
    p(
      'Jika kamu konsisten menyisihkan Rp 100.000 per bulan ke reksa dana saham dengan ',
      'rata-rata return 12% per tahun (sesuai historis IHSG jangka panjang):'
    ),
    ul(
      'Setelah 5 tahun: sekitar Rp 8,2 juta (dari total setoran Rp 6 juta)',
      'Setelah 10 tahun: sekitar Rp 23,2 juta (dari total setoran Rp 12 juta)',
      'Setelah 20 tahun: sekitar Rp 96,8 juta (dari total setoran Rp 24 juta)',
      'Setelah 30 tahun: sekitar Rp 349 juta (dari total setoran Rp 36 juta)',
    ),
    p(
      'Uang kamu tumbuh hampir ',
      bold('10 kali lipat'),
      ' dari total yang kamu setorkan dalam 30 tahun. ',
      'Dan itu hanya dari Rp 100.000 per bulan.'
    ),
    h2('Langkah Konkret untuk Mulai Hari Ini'),
    ol(
      'Download aplikasi investasi reksa dana: Bibit, Bareksa, atau MOST dari Mandiri Sekuritas',
      'Lakukan proses KYC (verifikasi identitas) — biasanya selesai dalam 1–2 hari',
      'Pilih reksa dana pasar uang sebagai permulaan — paling aman dan paling likuid',
      'Set auto-debit dari rekening utama ke rekening investasi di tanggal gajian',
      'Lupakan selama minimal 1 tahun. Jangan cek harga setiap hari',
    ),
    p(
      bold('Satu langkah yang diambil hari ini'),
      ' lebih berharga dari seribu rencana yang tidak pernah dieksekusi. ',
      'Mulai dari yang kamu mampu sekarang.'
    ),
  ),

  // FREE 2: 5 Kesalahan Investasi Pemula
  kesalahanInvestasi: doc(
    p(
      'Setiap investor pernah melakukan kesalahan. Tapi ada kesalahan yang bisa dihindari ',
      'jika kamu tahu lebih awal. Berikut lima kesalahan yang paling sering dilakukan investor pemula ',
      '— beserta cara konkret untuk menghindarinya.'
    ),
    h2('Kesalahan 1: Berinvestasi Tanpa Dana Darurat'),
    p(
      'Ini kesalahan paling fundamental. Dana darurat adalah fondasi keuangan yang harus ada ',
      'sebelum kamu mulai berinvestasi sepeser pun.'
    ),
    p(
      'Mengapa? Karena investasi yang baik membutuhkan waktu. Jika tiba-tiba kamu butuh uang mendesak ',
      '— PHK, sakit, kendaraan rusak — dan dana darurat tidak ada, kamu terpaksa ',
      italic('menjual investasi pada waktu yang salah'),
      '. Bisa jadi saat harga sedang turun.'
    ),
    p(
      bold('Solusi:'),
      ' Kumpulkan dana darurat 3–6 bulan pengeluaran terlebih dahulu di tabungan atau reksa dana pasar uang. ',
      'Baru setelah itu mulai investasi.'
    ),
    h2('Kesalahan 2: Mengikuti Hype dan FOMO'),
    p(
      '"Saham X naik 50% bulan lalu!" — lalu semua orang tiba-tiba jadi analis saham tersebut. ',
      'Fear of Missing Out (FOMO) adalah salah satu musuh terbesar investor.'
    ),
    p(
      'Ketika sebuah aset sudah ramai dibicarakan di media sosial dan grup WhatsApp, ',
      'biasanya harganya sudah sangat tinggi. Mereka yang terlambat masuk sering kali ',
      'menjadi ',
      italic('exit liquidity'),
      ' bagi investor yang sudah masuk lebih awal.'
    ),
    p(
      bold('Solusi:'),
      ' Investasikan hanya pada instrumen yang kamu pahami. Jika tidak bisa menjelaskan mengapa kamu beli ',
      'dalam dua kalimat sederhana, jangan beli.'
    ),
    h2('Kesalahan 3: Tidak Diversifikasi (Taruh Semua Telur dalam Satu Keranjang)'),
    p(
      'Menaruh semua modal di satu saham atau satu instrumen adalah strategi yang sangat berisiko. ',
      'Bahkan perusahaan besar pun bisa bangkrut. Kodak, Enron, Nokia — mereka semua ',
      'pernah jadi perusahaan raksasa sebelum kolaps.'
    ),
    p(
      bold('Solusi:'),
      ' Diversifikasikan investasi ke berbagai instrumen: reksa dana saham, obligasi, deposito, emas. ',
      'Dalam reksa dana pun sudah ada diversifikasi otomatis ke puluhan saham.'
    ),
    h2('Kesalahan 4: Panic Selling Saat Pasar Turun'),
    p(
      'Pasar saham PASTI akan turun. Ini bukan kemungkinan, ini kepastian. ',
      'Yang membedakan investor sukses dan tidak sukses adalah ',
      bold('bagaimana mereka merespons penurunan tersebut'),
      '.'
    ),
    p(
      'Menjual saat pasar turun mengunci kerugian yang sebelumnya hanya bersifat ',
      italic('di atas kertas'),
      '. Investor yang bertahan — bahkan menambah posisi saat turun — adalah yang meraih keuntungan ',
      'terbesar ketika pasar pulih.'
    ),
    p(
      bold('Solusi:'),
      ' Investasikan hanya uang yang tidak kamu butuhkan dalam 5 tahun ke depan. ',
      'Dengan begitu, fluktuasi jangka pendek tidak perlu ditakuti.'
    ),
    h2('Kesalahan 5: Tidak Punya Tujuan Investasi yang Jelas'),
    p(
      '"Biar uangnya berkembang" bukan tujuan investasi. Tujuan investasi harus spesifik: ',
      italic('untuk apa, berapa yang dibutuhkan, dan kapan dibutuhkan.'),
      ' Tanpa ini, kamu tidak tahu instrumen apa yang tepat dan tidak tahu kapan harus berhenti.'
    ),
    p(
      bold('Solusi:'),
      ' Tentukan tiga tujuan keuangan: jangka pendek (< 2 tahun), menengah (2–5 tahun), dan panjang (> 5 tahun). ',
      'Pilih instrumen investasi berdasarkan horizon waktu masing-masing tujuan.'
    ),
    h2('Penutup'),
    p(
      'Tidak ada investor yang tidak pernah melakukan kesalahan. Yang penting adalah belajar lebih cepat ',
      'dari kesalahan orang lain daripada harus mengalaminya sendiri. ',
      'Mulai investasi dengan sadar, bukan dengan harapan kaya cepat.'
    ),
  ),

  // FREE 3: Reksa Dana 101
  reksaDana: doc(
    p(
      'Reksa dana adalah salah satu instrumen investasi paling demokratis yang pernah ada. ',
      'Dengan modal kecil, kamu bisa memiliki porsi dari puluhan — bahkan ratusan — saham atau obligasi ',
      'sekaligus, dikelola oleh fund manager profesional yang berpengalaman.'
    ),
    h2('Apa Itu Reksa Dana?'),
    p(
      'Reksa dana adalah wadah yang menghimpun dana dari banyak investor, kemudian diinvestasikan ',
      'oleh Manajer Investasi (MI) ke berbagai instrumen sesuai kebijakan investasi yang tercantum ',
      'dalam prospektusnya. Seluruh reksa dana yang dijual di Indonesia ',
      bold('wajib terdaftar dan diawasi oleh OJK'),
      ' (Otoritas Jasa Keuangan).'
    ),
    p(
      'Kamu tidak perlu menjadi ahli pasar modal untuk berinvestasi di reksa dana. ',
      'Fund manager yang melakukan riset, pemilihan efek, dan rebalancing portofolio atas nama kamu.'
    ),
    h2('Empat Jenis Reksa Dana'),
    h3('1. Reksa Dana Pasar Uang'),
    p(
      'Investasi ke instrumen jangka pendek: deposito, SBI (Sertifikat Bank Indonesia), ',
      'dan surat utang dengan jatuh tempo < 1 tahun. ',
      bold('Cocok untuk:'),
      ' dana darurat, tabungan jangka pendek. Return 4–6% per tahun. Risiko: sangat rendah.'
    ),
    h3('2. Reksa Dana Pendapatan Tetap'),
    p(
      'Minimal 80% portofolio diinvestasikan ke obligasi (surat utang). ',
      bold('Cocok untuk:'),
      ' tujuan 2–3 tahun. Return 6–9% per tahun. Risiko: rendah-menengah.'
    ),
    h3('3. Reksa Dana Campuran'),
    p(
      'Kombinasi saham, obligasi, dan pasar uang dengan proporsi fleksibel. ',
      bold('Cocok untuk:'),
      ' tujuan 3–5 tahun. Return 8–15% per tahun. Risiko: menengah.'
    ),
    h3('4. Reksa Dana Saham'),
    p(
      'Minimal 80% diinvestasikan ke saham. Potensi return tertinggi tapi fluktuasi terbesar. ',
      bold('Cocok untuk:'),
      ' tujuan > 5 tahun. Return historis 10–15% per tahun. Risiko: tinggi.'
    ),
    h2('Keunggulan Reksa Dana vs Beli Saham Langsung'),
    ul(
      'Diversifikasi otomatis — 1 reksa dana bisa berisi puluhan saham sekaligus',
      'Modal kecil — mulai dari Rp 10.000 di beberapa platform',
      'Tidak perlu monitoring harian — fund manager yang bekerja untuk kamu',
      'Regulasi ketat OJK — dana dipisahkan dari aset Manajer Investasi (aman jika MI bangkrut)',
      'Likuiditas baik — pencairan dalam 1–7 hari kerja tergantung jenis reksa dana',
    ),
    h2('Cara Mulai Berinvestasi Reksa Dana'),
    ol(
      'Pilih platform: Bibit (robo-advisor, cocok pemula), Bareksa (pilihan terlengkap), atau aplikasi bank',
      'Daftar akun dan lakukan KYC (upload KTP, selfie, nomor rekening) — gratis',
      'Isi profil risiko — platform akan merekomendasikan portofolio sesuai profil kamu',
      'Pilih reksa dana dan transfer dana awal minimal sesuai ketentuan',
      'Aktifkan auto-invest bulanan dari rekening — dan lupakan selama minimal 1 tahun',
    ),
    h2('Biaya yang Perlu Diperhatikan'),
    p(
      'Reksa dana memiliki biaya yang disebut ',
      bold('Expense Ratio'),
      ' atau biaya pengelolaan tahunan, biasanya 0,5–3% per tahun, sudah otomatis dipotong dari NAB. ',
      'Beberapa platform juga mengenakan biaya pembelian (subscription fee) dan penjualan (redemption fee). ',
      'Bandingkan biaya antar produk sebelum memilih.'
    ),
    p(
      'Reksa dana bukan investasi ajaib yang selalu naik. Nilainya bisa turun, terutama reksa dana saham. ',
      'Yang penting: pilih sesuai tujuan dan horizon waktu, lalu ',
      bold('konsisten berinvestasi secara rutin'),
      ' terlepas dari kondisi pasar.'
    ),
  ),

  // PREMIUM 1: Strategi Alokasi Aset
  alokasiAset: doc(
    p(
      'Investasi yang paling menguntungkan bukan selalu yang returnnya paling tinggi, ',
      'melainkan yang ',
      italic('sesuai dengan profil risiko dan tujuan keuanganmu'),
      '. Di sinilah strategi alokasi aset menjadi fondasi dari portofolio yang tahan banting.'
    ),
    h2('Apa Itu Alokasi Aset?'),
    p(
      'Alokasi aset adalah keputusan strategis tentang berapa persen dari total investasimu ',
      'yang akan ditempatkan di masing-masing kelas aset: saham, obligasi, kas/pasar uang, ',
      'aset alternatif (emas, properti, kripto). ',
      'Riset akademik menunjukkan bahwa ',
      bold('alokasi aset bertanggung jawab atas lebih dari 90% variasi return portofolio'),
      ' dalam jangka panjang — bukan stock picking.'
    ),
    h2('Aturan 100 Minus Usia: Panduan Sederhana'),
    p(
      'Aturan paling terkenal untuk alokasi aset adalah ',
      bold('100 minus usia'),
      '. Hasilnya adalah persentase yang sebaiknya dialokasikan ke saham. Sisanya ke obligasi/pasar uang.'
    ),
    p(
      'Contoh: usia 30 tahun → 70% saham, 30% obligasi. Usia 50 tahun → 50% saham, 50% obligasi.'
    ),
    p(
      'Logikanya: semakin muda, semakin panjang waktu untuk pulih dari volatilitas. ',
      'Semakin tua, semakin dibutuhkan stabilitas dan perlindungan modal.'
    ),
    h2('Pendekatan yang Lebih Nuanced: Risk Tolerance'),
    p(
      'Aturan 100 minus usia adalah titik awal yang baik, tapi tidak satu ukuran untuk semua. ',
      'Dua orang berusia sama bisa punya toleransi risiko yang sangat berbeda. ',
      'Tanyakan dirimu tiga pertanyaan ini:'
    ),
    ul(
      'Jika portofoliomu turun 30% dalam satu bulan, apa reaksimu? (Panik/tenang/tambah posisi?)',
      'Berapa tahun lagi uang ini dibutuhkan? (< 3 tahun = konservatif, > 10 tahun = agresif)',
      'Apakah kamu punya sumber penghasilan lain yang stabil jika investasi merugi?',
    ),
    h2('Tiga Profil Portofolio Referensi'),
    h3('Konservatif (toleransi risiko rendah)'),
    p(
      '20% saham/reksa dana saham, 50% obligasi/reksa dana pendapatan tetap, ',
      '30% pasar uang/deposito. ',
      'Return ekspektasi: 6–8% per tahun. Volatilitas rendah.'
    ),
    h3('Moderat (toleransi risiko menengah)'),
    p(
      '50% saham/reksa dana saham, 30% obligasi/reksa dana pendapatan tetap, ',
      '20% pasar uang/emas. ',
      'Return ekspektasi: 9–12% per tahun. Volatilitas menengah.'
    ),
    h3('Agresif (toleransi risiko tinggi)'),
    p(
      '80% saham/reksa dana saham, 10% obligasi, 10% aset alternatif. ',
      'Return ekspektasi: 12–18% per tahun. Volatilitas tinggi — bisa turun 40%+ dalam krisis.'
    ),
    h2('Rebalancing: Menjaga Alokasi tetap pada Target'),
    p(
      'Setelah menentukan alokasi, pekerjaan belum selesai. ',
      'Seiring waktu, beberapa aset akan tumbuh lebih cepat dan mengubah komposisi portofolio. ',
      'Saham yang naik 30% akan membuat persentase sahammu melebihi target.'
    ),
    p(
      bold('Rebalancing'),
      ' adalah proses menjual aset yang melebihi target dan membeli aset yang di bawah target ',
      'untuk mengembalikan komposisi ke alokasi asal. ',
      'Lakukan rebalancing minimal ',
      bold('setahun sekali'),
      ', atau ketika deviasi dari target melebihi 10 persen poin.'
    ),
    h2('Alokasi Aset dalam Praktik: Contoh Konkret'),
    p(
      'Budi, 32 tahun, punya total investasi Rp 100 juta dengan profil moderat. ',
      'Target alokasi: 55% saham, 30% obligasi, 15% pasar uang.'
    ),
    p(
      'Setelah 1 tahun, saham naik 25%: portofolio menjadi 65% saham, 25% obligasi, 10% pasar uang. ',
      'Budi melakukan rebalancing: jual Rp 10 juta saham, beli Rp 5 juta obligasi + Rp 5 juta pasar uang. ',
      'Portofolio kembali ke target.'
    ),
    p(
      'Strategi ini disebut "beli murah, jual mahal" yang dilakukan secara sistematis — ',
      'tanpa perlu menebak arah pasar.'
    ),
  ),

  // PREMIUM 2: Analisis Fundamental Saham
  analisisFundamental: doc(
    p(
      'Memilih saham yang tepat bukan tentang menebak mana yang akan naik besok. ',
      'Ini tentang memahami ',
      italic('nilai intrinsik'),
      ' sebuah bisnis dan membeli ketika harganya di bawah nilai tersebut. ',
      'Inilah inti dari analisis fundamental.'
    ),
    h2('Mengapa Analisis Fundamental Penting'),
    p(
      'Warren Buffett, investor terkaya dalam sejarah melalui investasi saham, pernah berkata: ',
      italic('"Harga adalah apa yang kamu bayar. Nilai adalah apa yang kamu dapatkan."'),
      ' Analisis fundamental adalah alat untuk menemukan nilai tersebut.'
    ),
    p(
      'Berbeda dengan analisis teknikal yang memprediksi pergerakan harga dari grafik, ',
      'analisis fundamental menilai kesehatan bisnis dari laporan keuangannya. ',
      'Hasilnya lebih relevan untuk investasi jangka panjang.'
    ),
    h2('Lima Rasio Keuangan yang Wajib Dipahami'),
    h3('1. Price to Earnings Ratio (P/E)'),
    p(
      bold('Cara hitung:'),
      ' Harga saham ÷ Earnings Per Share (EPS). ',
      bold('Artinya:'),
      ' berapa rupiah yang harus kamu bayar untuk mendapat Rp 1 keuntungan perusahaan. ',
      'P/E 15× berarti kamu membayar Rp 15 untuk setiap Rp 1 laba per saham. ',
      'Bandingkan dengan rata-rata industri — P/E tinggi bisa artinya mahal atau pertumbuhan tinggi.'
    ),
    h3('2. Price to Book Value (PBV)'),
    p(
      bold('Cara hitung:'),
      ' Harga saham ÷ Book Value Per Share. ',
      bold('Artinya:'),
      ' berapa kali kamu membayar dibanding nilai buku perusahaan (aset minus utang). ',
      'PBV < 1 bisa artinya saham undervalued, tapi bisa juga artinya perusahaan memang sedang bermasalah. ',
      'Selalu lihat bersama rasio lainnya.'
    ),
    h3('3. Return on Equity (ROE)'),
    p(
      bold('Cara hitung:'),
      ' Laba Bersih ÷ Ekuitas Pemegang Saham × 100%. ',
      bold('Artinya:'),
      ' seberapa efisien perusahaan menghasilkan laba dari modal yang dimiliki pemegang saham. ',
      'ROE > 15% umumnya dianggap baik. ROE yang konsisten selama beberapa tahun ',
      'adalah tanda manajemen yang kompeten.'
    ),
    h3('4. Debt to Equity Ratio (DER)'),
    p(
      bold('Cara hitung:'),
      ' Total Utang ÷ Ekuitas Pemegang Saham. ',
      bold('Artinya:'),
      ' seberapa banyak perusahaan menggunakan utang dibanding modal sendiri. ',
      'DER < 1 umumnya dianggap sehat. DER tinggi meningkatkan risiko saat ekonomi melambat, ',
      'karena perusahaan harus tetap membayar cicilan utang meski laba turun.'
    ),
    h3('5. Earnings Per Share (EPS)'),
    p(
      bold('Cara hitung:'),
      ' Laba Bersih ÷ Jumlah Saham Beredar. ',
      bold('Artinya:'),
      ' laba yang dihasilkan untuk setiap lembar saham. ',
      'Perhatikan tren EPS — apakah tumbuh konsisten dari tahun ke tahun? ',
      'EPS yang terus tumbuh adalah sinyal positif kesehatan bisnis.'
    ),
    h2('Cara Membaca Laporan Keuangan Dasar'),
    p(
      'Laporan keuangan terdiri dari tiga dokumen utama yang saling terhubung:'
    ),
    ul(
      'Neraca (Balance Sheet): foto kondisi keuangan perusahaan di satu titik waktu — aset, liabilitas, ekuitas',
      'Laporan Laba Rugi (Income Statement): rekap pendapatan dan pengeluaran dalam satu periode',
      'Laporan Arus Kas (Cash Flow Statement): pergerakan kas aktual — lebih sulit dimanipulasi dari laba',
    ),
    p(
      bold('Tips penting:'),
      ' Jangan hanya lihat laba bersih. Laba bisa direkayasa secara akuntansi. ',
      'Arus kas operasional (Operating Cash Flow) lebih mencerminkan kondisi bisnis yang sesungguhnya. ',
      'Jika laba tinggi tapi arus kas operasional negatif — ini tanda bahaya.'
    ),
    h2('Red Flags yang Harus Diwaspadai'),
    ul(
      'Penjualan tumbuh tapi arus kas operasional turun — bisa indikasi piutang bermasalah',
      'Utang meningkat drastis tanpa peningkatan pendapatan yang setara',
      'Manajemen sering mengganti auditor eksternal',
      'Pemegang saham mayoritas terus menjual sahamnya',
      'ROE tinggi karena utang besar, bukan karena efisiensi bisnis',
    ),
    h2('Mulai Latihan dengan Saham yang Kamu Kenal'),
    p(
      'Cara terbaik untuk belajar analisis fundamental adalah memulai dengan perusahaan ',
      'yang produk atau jasanya kamu gunakan sehari-hari. Bank yang kamu pakai, ',
      'supermarket langganan kamu, atau platform digital yang kamu akses setiap hari. ',
      'Pemahaman bisnis yang kuat adalah fondasi analisis yang baik.'
    ),
    p(
      'Laporan keuangan perusahaan publik Indonesia bisa diakses gratis di ',
      bold('idx.co.id'),
      ' dan aplikasi IDX Mobile. Mulai dari laporan kuartalan terakhir dan bandingkan dengan dua tahun sebelumnya.'
    ),
  ),

  // PREMIUM 3: DCA vs Lump Sum
  dcaVsLumpSum: doc(
    p(
      'Kamu baru dapat bonus akhir tahun Rp 50 juta. Pertanyaan klasik segera muncul: ',
      'investasikan sekarang semuanya sekaligus, atau cicil per bulan? ',
      'Ini perdebatan abadi antara Dollar Cost Averaging (DCA) dan Lump Sum — dan jawabannya tidak sesederhana yang dikira.'
    ),
    h2('Apa Itu Dollar Cost Averaging (DCA)?'),
    p(
      'DCA adalah strategi menginvestasikan jumlah tetap secara rutin pada interval yang konsisten, ',
      'terlepas dari kondisi pasar. Misalnya: Rp 1 juta setiap bulan tanggal 1, ',
      'apapun yang terjadi di pasar saham.'
    ),
    p(
      'Efek yang dihasilkan: saat harga turun, kamu otomatis membeli lebih banyak unit. ',
      'Saat harga naik, kamu membeli lebih sedikit unit. Rata-rata harga beli (Cost Average) ',
      'secara alami menjadi lebih rendah dari rata-rata harga pasar.'
    ),
    h2('Apa Itu Lump Sum?'),
    p(
      'Lump Sum adalah menginvestasikan seluruh dana sekaligus di satu titik waktu. ',
      'Kamu menerima return dari seluruh modal sejak hari pertama — ',
      'tidak ada dana yang "menganggur" menunggu diinvestasikan.'
    ),
    h2('Bukti Data: Lump Sum Menang Secara Statistik'),
    p(
      'Penelitian Vanguard (2012) menganalisis data S&P 500, FTSE Inggris, dan pasar Australia ',
      'selama 10 tahun. Hasilnya: dalam ',
      bold('lebih dari 65% kasus'),
      ', Lump Sum menghasilkan return yang lebih tinggi dari DCA selama 10 tahun ke depan.'
    ),
    p(
      'Logikanya sederhana: pasar saham secara historis ',
      bold('cenderung naik seiring waktu'),
      '. Jika kamu menunggu untuk mencicil investasi, sebagian modal "tertinggal" ',
      'dari kenaikan pasar yang seharusnya sudah dinikmati.'
    ),
    h2('Tapi Mengapa DCA Masih Relevan?'),
    p(
      'Ada dua alasan kuat mengapa DCA tetap strategi yang masuk akal dalam banyak situasi:'
    ),
    h3('1. Faktor Psikologis'),
    p(
      'Teori sering kalah dengan emosi. Bayangkan kamu invest Rp 50 juta Lump Sum hari ini, ',
      'lalu besok IHSG turun 20%. Secara rasional kamu tahu ini sementara — tapi secara emosional, ',
      'sangat sulit untuk tidak panik. DCA mengurangi risiko "worst case scenario" ini ',
      'dan membantu menjaga disiplin investasi.'
    ),
    h3('2. Ketika Modal Memang Datang Bertahap'),
    p(
      'Bagi sebagian besar orang, investasi dilakukan dari gaji bulanan — ',
      'ini secara alami sudah DCA. Tidak ada dana besar sekaligus yang perlu diputuskan. ',
      'DCA adalah strategi yang paling tepat untuk situasi ini.'
    ),
    h2('Kesimpulan: Pilih Berdasarkan Situasimu'),
    ul(
      'Punya dana besar sekaligus + tahan banting secara emosional → Lump Sum (return lebih tinggi secara statistik)',
      'Punya dana besar sekaligus + cemas dengan volatilitas → DCA selama 6–12 bulan sebagai kompromi',
      'Investasi dari penghasilan rutin bulanan → DCA secara alami (tidak ada pilihan lain)',
      'Pasar sedang dalam kondisi sangat overvalued → argumen untuk DCA lebih kuat',
    ),
    p(
      bold('Yang paling penting bukan Lump Sum vs DCA'),
      ' — melainkan ',
      bold('apakah kamu benar-benar menginvestasikan dananya atau tidak'),
      '. Sebaik apapun strategi yang dipilih, tidak ada artinya jika tidak dieksekusi.'
    ),
  ),

  // DRAFT: Obligasi
  obligasiDraft: doc(
    p(
      'Ketika kamu membeli obligasi, kamu pada dasarnya meminjamkan uang kepada penerbit obligasi — ',
      'bisa pemerintah, BUMN, atau perusahaan swasta. Sebagai imbalannya, ',
      'kamu menerima bunga (kupon) secara periodik dan pengembalian pokok saat jatuh tempo.'
    ),
    p(
      'Artikel ini akan membahas perbedaan antara Obligasi Pemerintah dan Obligasi Korporasi, ',
      'beserta risiko dan potensi return masing-masing. [Draft — belum selesai]'
    ),
  ),

  // SCHEDULED: Properti 2026
  properti2026: doc(
    p(
      'Pasar properti Indonesia di 2026 menunjukkan tanda-tanda pemulihan yang signifikan ',
      'setelah beberapa tahun konsolidasi pasca pandemi. Namun investasi properti ',
      'memiliki karakteristik unik yang berbeda dari saham atau reksa dana.'
    ),
    p(
      'Artikel ini akan mengupas peluang dan risiko investasi properti di 2026, ',
      'termasuk area-area yang diprediksi mengalami apresiasi harga tertinggi ',
      'dan strategi untuk investor dengan modal terbatas.'
    ),
    h2('Tren Utama Pasar Properti 2026'),
    p(
      'Pembangunan Ibu Kota Nusantara (IKN) terus mendorong permintaan properti di Kalimantan Timur. ',
      'Sementara itu, pengembangan koridor MRT dan LRT di Jakarta membuka peluang ',
      'transit-oriented development (TOD) yang menarik bagi investor.'
    ),
  ),
};

// ─── Main seed ───────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 Seeding Investasi Cerdas — realistic dev data...\n');

  // ── 0. Hash passwords in parallel ──────────────────────────────────────────
  const [
    platformOwnerHash,
    adminHash,
    ownerHash,
    authorHash,
    memberHash,
  ] = await Promise.all([
    argon2.hash('PlatformOwner123!'),
    argon2.hash('Admin123!'),
    argon2.hash('Owner123!'),
    argon2.hash('Author123!'),
    argon2.hash('Member123!'),
  ]);
  console.log('✓ Passwords hashed');

  // ── 0b. Cleanup old "lentera" publication from previous seed ────────────────
  const oldPub = await prisma.publication.findUnique({ where: { slug: 'lentera' } });
  if (oldPub) {
    // Delete non-cascading relations first
    await prisma.subscription.deleteMany({ where: { publicationId: oldPub.id } });
    await prisma.publication.delete({ where: { id: oldPub.id } });
    console.log('✓ Old "lentera" publication removed');
  }

  // ── 1. Platform Owner + Admin ──────────────────────────────────────────────
  const platformOwnerUser = await prisma.user.upsert({
    where: { email: 'owner@lentera.id' },
    update: {
      id: ID.platformOwner,
      passwordHash: platformOwnerHash,
      name: 'Bima Wicaksana',
      emailVerifiedAt: new Date(),
      role: UserRole.platform_admin,
    },
    create: {
      id: ID.platformOwner,
      email: 'owner@lentera.id',
      name: 'Bima Wicaksana',
      passwordHash: platformOwnerHash,
      bio: 'Pendiri dan pemilik platform Lentera. Membangun ekosistem penulisan digital Indonesia.',
      emailVerifiedAt: new Date(),
      role: UserRole.platform_admin,
    },
  });
  console.log(`✓ Platform owner  : ${platformOwnerUser.email}`);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lentera.id' },
    update: {
      id: ID.adminUser,
      passwordHash: adminHash,
      name: 'Anya Permata',
      emailVerifiedAt: new Date(),
      role: UserRole.platform_admin,
    },
    create: {
      id: ID.adminUser,
      email: 'admin@lentera.id',
      name: 'Anya Permata',
      passwordHash: adminHash,
      bio: 'Pengelola platform Lentera. Fokus pada pengembangan ekosistem penulisan digital Indonesia.',
      emailVerifiedAt: new Date(),
      role: UserRole.platform_admin,
    },
  });
  console.log(`✓ Platform admin  : ${adminUser.email}`);

  // ── 2. Publication ──────────────────────────────────────────────────────────
  const publication = await prisma.publication.upsert({
    where: { slug: 'investasi-cerdas' },
    update: {
      id: ID.pub,
      name: 'Investasi Cerdas',
      description:
        'Panduan investasi berbasis data untuk investor Indonesia — dari reksa dana, saham, hingga aset alternatif. Ditulis oleh praktisi, bukan hanya teori.',
      logoUrl: COVERS.pub,
      platformFeePercent: 15,
    },
    create: {
      id: ID.pub,
      slug: 'investasi-cerdas',
      name: 'Investasi Cerdas',
      description:
        'Panduan investasi berbasis data untuk investor Indonesia — dari reksa dana, saham, hingga aset alternatif. Ditulis oleh praktisi, bukan hanya teori.',
      logoUrl: COVERS.pub,
      platformFeePercent: 15,
    },
  });
  console.log(`✓ Publication     : ${publication.name} (${publication.slug})`);

  // ── 3. Publication Users ────────────────────────────────────────────────────
  const pubOwner = await prisma.user.upsert({
    where: { email: 'owner@investasicerdas.id' },
    update: {
      id: ID.pubOwner,
      passwordHash: ownerHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      id: ID.pubOwner,
      email: 'owner@investasicerdas.id',
      name: 'Budi Santoso',
      passwordHash: ownerHash,
      bio: 'CFA charterholder dengan 12 tahun pengalaman di industri keuangan. Pendiri Investasi Cerdas — karena literasi keuangan seharusnya accessible untuk semua.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Owner           : ${pubOwner.email}`);

  // Publication admin — role masih "author" karena EPIC 14 (tambah role admin) belum diimplementasi
  const pubAdmin = await prisma.user.upsert({
    where: { email: 'admin-pub@investasicerdas.id' },
    update: {
      id: ID.pubAdmin,
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      id: ID.pubAdmin,
      email: 'admin-pub@investasicerdas.id',
      name: 'Sari Dewi',
      passwordHash: adminHash,
      bio: 'Editor dan content strategist Investasi Cerdas. Mantan jurnalis ekonomi yang beralih ke dunia investasi.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Pub admin (admin role): ${pubAdmin.email}`);

  const author1 = await prisma.user.upsert({
    where: { email: 'author1@investasicerdas.id' },
    update: {
      id: ID.author1,
      passwordHash: authorHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      id: ID.author1,
      email: 'author1@investasicerdas.id',
      name: 'Eko Prasetyo',
      passwordHash: authorHash,
      bio: 'Analis saham dengan fokus pada sektor perbankan dan konsumer. Lulusan Ekonomi UI.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Author 1        : ${author1.email}`);

  const author2 = await prisma.user.upsert({
    where: { email: 'author2@investasicerdas.id' },
    update: {
      id: ID.author2,
      passwordHash: authorHash,
      emailVerifiedAt: new Date(),
    },
    create: {
      id: ID.author2,
      email: 'author2@investasicerdas.id',
      name: 'Dewi Kusuma',
      passwordHash: authorHash,
      bio: 'Spesialis reksa dana dan financial planner bersertifikat. Membantu klien merancang portofolio berbasis tujuan.',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Author 2        : ${author2.email}`);

  // ── 4. Member Users ─────────────────────────────────────────────────────────
  const member1 = await prisma.user.upsert({
    where: { email: 'member1@example.com' },
    update: { id: ID.member1, passwordHash: memberHash, emailVerifiedAt: new Date() },
    create: {
      id: ID.member1,
      email: 'member1@example.com',
      name: 'Reza Firmansyah',
      passwordHash: memberHash,
      bio: 'Software engineer yang mulai serius investasi sejak 2024.',
      emailVerifiedAt: new Date(),
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@example.com' },
    update: { id: ID.member2, passwordHash: memberHash, emailVerifiedAt: new Date() },
    create: {
      id: ID.member2,
      email: 'member2@example.com',
      name: 'Nina Rahayu',
      passwordHash: memberHash,
      bio: 'Guru SMA yang ingin mempersiapkan dana pensiun sejak dini.',
      emailVerifiedAt: new Date(),
    },
  });

  const member3 = await prisma.user.upsert({
    where: { email: 'member3@example.com' },
    update: { id: ID.member3, passwordHash: memberHash, emailVerifiedAt: new Date() },
    create: {
      id: ID.member3,
      email: 'member3@example.com',
      name: 'Hendra Wijaya',
      passwordHash: memberHash,
      bio: 'Pengusaha UMKM yang ingin diversifikasi aset di luar bisnis utama.',
      emailVerifiedAt: new Date(),
    },
  });

  const memberExpired = await prisma.user.upsert({
    where: { email: 'member-expired@example.com' },
    update: { id: ID.memberExpired, passwordHash: memberHash, emailVerifiedAt: new Date() },
    create: {
      id: ID.memberExpired,
      email: 'member-expired@example.com',
      name: 'Andi Setiawan',
      passwordHash: memberHash,
      bio: 'Investor pemula yang sedang mempertimbangkan perpanjangan subscription.',
      emailVerifiedAt: new Date(),
    },
  });

  const memberFree = await prisma.user.upsert({
    where: { email: 'member-free@example.com' },
    update: { id: ID.memberFree, passwordHash: memberHash, emailVerifiedAt: new Date() },
    create: {
      id: ID.memberFree,
      email: 'member-free@example.com',
      name: 'Fitri Handayani',
      passwordHash: memberHash,
      bio: 'Baru mulai tertarik investasi, masih di tahap membaca artikel gratis.',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Members         : 3 aktif, 1 expired, 1 gratis`);

  // ── 5. Publication Author Records ───────────────────────────────────────────
  const authorAssignments = [
    { userId: pubOwner.id, role: AuthorRole.owner },
    { userId: pubAdmin.id, role: AuthorRole.admin },
    { userId: author1.id,  role: AuthorRole.author },
    { userId: author2.id,  role: AuthorRole.author },
  ];

  for (const a of authorAssignments) {
    await prisma.publicationAuthor.upsert({
      where: { publicationId_userId: { publicationId: publication.id, userId: a.userId } },
      update: { role: a.role },
      create: { publicationId: publication.id, userId: a.userId, role: a.role },
    });
  }
  console.log(`✓ Publication authors assigned (owner + 3 authors)`);

  // ── 6. Subscription Plans ───────────────────────────────────────────────────
  // price = per-bulan; total = price × durationMonths
  // target total: 49rb | 129rb | 240rb | 450rb
  const plans = [
    { id: ID.plan1mo,  durationMonths: 1,  price: 49000,  label: '1 bulan  → Rp 49.000'  },
    { id: ID.plan3mo,  durationMonths: 3,  price: 43000,  label: '3 bulan  → Rp 129.000' },
    { id: ID.plan6mo,  durationMonths: 6,  price: 40000,  label: '6 bulan  → Rp 240.000' },
    { id: ID.plan12mo, durationMonths: 12, price: 37500,  label: '12 bulan → Rp 450.000' },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: { price: plan.price, isActive: true },
      create: {
        id: plan.id,
        publicationId: publication.id,
        durationMonths: plan.durationMonths,
        price: plan.price,
        isActive: true,
      },
    });
  }

  await prisma.subscriptionPlan.updateMany({
    where: {
      publicationId: publication.id,
      id: { notIn: plans.map((p) => p.id) },
    },
    data: { isActive: false },
  });
  console.log(`✓ Subscription plans:\n  ${plans.map((p) => p.label).join('\n  ')}`);

  // ── 7. Tags ─────────────────────────────────────────────────────────────────
  const tagDefs = [
    { id: ID.tagInvestasi, name: 'Investasi',    slug: 'investasi'    },
    { id: ID.tagSaham,     name: 'Saham',        slug: 'saham'        },
    { id: ID.tagReksaDana, name: 'Reksa Dana',   slug: 'reksa-dana'   },
    { id: ID.tagObligasi,  name: 'Obligasi',     slug: 'obligasi'     },
    { id: ID.tagProperti,  name: 'Properti',     slug: 'properti'     },
    { id: ID.tagPemula,    name: 'Untuk Pemula', slug: 'untuk-pemula' },
  ];

  const tags: Record<string, { id: string }> = {};
  for (const t of tagDefs) {
    const tag = await prisma.tag.upsert({
      where: { publicationId_slug: { publicationId: publication.id, slug: t.slug } },
      update: {},
      create: { id: t.id, publicationId: publication.id, name: t.name, slug: t.slug },
    });
    tags[t.slug] = tag;
  }
  console.log(`✓ Tags: ${tagDefs.map((t) => t.name).join(', ')}`);

  // ── 8. Articles ─────────────────────────────────────────────────────────────
  const now = new Date();
  const scheduledDate = new Date('2026-06-15T08:00:00Z');

  const articleDefs = [
    // FREE articles (published)
    {
      id: ID.artFree1,
      slug: 'mulai-investasi-dari-100-ribu',
      title: 'Mulai Investasi dari Rp 100.000: Panduan Lengkap untuk Pemula',
      excerpt:
        'Banyak yang menunda investasi karena merasa modalnya belum cukup besar. Padahal waktu yang hilang jauh lebih mahal dari modal yang tertunda. Panduan ini membuktikannya dengan angka.',
      coverImageUrl: COVERS.free1,
      status: ArticleStatus.published,
      visibility: Visibility.free,
      readingTime: 5,
      authorId: pubOwner.id,
      publishedAt: new Date('2026-05-01T08:00:00Z'),
      tags: ['investasi', 'reksa-dana', 'untuk-pemula'],
    },
    {
      id: ID.artFree2,
      slug: '5-kesalahan-investasi-pemula',
      title: '5 Kesalahan Investasi yang Sering Dilakukan Pemula (dan Cara Menghindarinya)',
      excerpt:
        'FOMO, panic selling, tidak punya dana darurat — lima jebakan ini sudah menghancurkan portofolio ribuan investor pemula. Pelajari sebelum kamu mengalaminya sendiri.',
      coverImageUrl: COVERS.free2,
      status: ArticleStatus.published,
      visibility: Visibility.free,
      readingTime: 6,
      authorId: author1.id,
      publishedAt: new Date('2026-05-08T08:00:00Z'),
      tags: ['investasi', 'untuk-pemula'],
    },
    {
      id: ID.artFree3,
      slug: 'reksa-dana-101-panduan-lengkap-pemula',
      title: 'Reksa Dana 101: Panduan Lengkap untuk Investor Pemula Indonesia',
      excerpt:
        'Reksa dana adalah pintu masuk investasi paling demokratis: modal Rp 10.000, diversifikasi otomatis, dikelola profesional, dan diawasi OJK. Ini semua yang perlu kamu tahu.',
      coverImageUrl: COVERS.free3,
      status: ArticleStatus.published,
      visibility: Visibility.free,
      readingTime: 7,
      authorId: author2.id,
      publishedAt: new Date('2026-05-15T08:00:00Z'),
      tags: ['reksa-dana', 'investasi', 'untuk-pemula'],
    },
    // PREMIUM articles (published)
    {
      id: ID.artPremium1,
      slug: 'strategi-alokasi-aset-portofolio-tahan-banting',
      title: 'Strategi Alokasi Aset: Cara Membangun Portofolio yang Tahan Banting di Segala Kondisi',
      excerpt:
        'Riset akademik membuktikan bahwa 90% variasi return portofolio ditentukan oleh alokasi aset — bukan stock picking. Pelajari cara merancang portofolio yang tepat untuk profilmu.',
      coverImageUrl: COVERS.premium1,
      status: ArticleStatus.published,
      visibility: Visibility.members_only,
      readingTime: 8,
      authorId: pubOwner.id,
      publishedAt: new Date('2026-05-20T08:00:00Z'),
      tags: ['investasi', 'saham', 'reksa-dana'],
    },
    {
      id: ID.artPremium2,
      slug: 'analisis-fundamental-saham-laporan-keuangan',
      title: 'Analisis Fundamental Saham: Cara Membaca Laporan Keuangan Perusahaan',
      excerpt:
        'P/E ratio, PBV, ROE, DER — angka-angka ini adalah kunci untuk menilai apakah sebuah saham layak dibeli atau tidak. Panduan praktis dengan contoh nyata perusahaan Indonesia.',
      coverImageUrl: COVERS.premium2,
      status: ArticleStatus.published,
      visibility: Visibility.members_only,
      readingTime: 10,
      authorId: author1.id,
      publishedAt: new Date('2026-05-27T08:00:00Z'),
      tags: ['saham', 'investasi'],
    },
    {
      id: ID.artPremium3,
      slug: 'dollar-cost-averaging-vs-lump-sum',
      title: 'Dollar Cost Averaging vs Lump Sum: Data Bicara, Mana yang Lebih Menguntungkan?',
      excerpt:
        'Dapat bonus Rp 50 juta — invest sekaligus atau cicil per bulan? Penelitian Vanguard punya jawabannya, tapi ada faktor psikologis yang data tidak bisa abaikan.',
      coverImageUrl: COVERS.premium3,
      status: ArticleStatus.published,
      visibility: Visibility.members_only,
      readingTime: 7,
      authorId: author2.id,
      publishedAt: new Date('2026-06-01T08:00:00Z'),
      tags: ['investasi', 'reksa-dana', 'saham'],
    },
    // Draft
    {
      id: ID.artDraft,
      slug: 'obligasi-pemerintah-vs-korporasi',
      title: 'Obligasi Pemerintah vs Obligasi Korporasi: Mana yang Lebih Aman untuk Portofoliomu?',
      excerpt:
        'ORI vs obligasi korporasi — keduanya menjanjikan kupon tetap, tapi risiko dan karakteristiknya sangat berbeda. Panduan memilih yang tepat berdasarkan profil investor.',
      coverImageUrl: COVERS.draft,
      status: ArticleStatus.draft,
      visibility: Visibility.members_only,
      readingTime: 8,
      authorId: pubAdmin.id,
      publishedAt: null,
      tags: ['obligasi', 'investasi'],
    },
    // Scheduled
    {
      id: ID.artScheduled,
      slug: 'prospek-investasi-properti-2026',
      title: 'Prospek Investasi Properti di 2026: Peluang dan Tantangan yang Perlu Diketahui',
      excerpt:
        'IKN, koridor MRT, dan normalisasi suku bunga membuka peluang baru di pasar properti 2026. Tapi tidak semua properti diciptakan sama — begini cara memilih yang tepat.',
      coverImageUrl: COVERS.scheduled,
      status: ArticleStatus.scheduled,
      visibility: Visibility.members_only,
      readingTime: 9,
      authorId: pubOwner.id,
      publishedAt: null,
      scheduledAt: scheduledDate,
      tags: ['properti', 'investasi'],
    },
  ];

  const contentMap: Record<string, TiptapNode> = {
    [ID.artFree1]:     content.mulaiInvestasi,
    [ID.artFree2]:     content.kesalahanInvestasi,
    [ID.artFree3]:     content.reksaDana,
    [ID.artPremium1]:  content.alokasiAset,
    [ID.artPremium2]:  content.analisisFundamental,
    [ID.artPremium3]:  content.dcaVsLumpSum,
    [ID.artDraft]:     content.obligasiDraft,
    [ID.artScheduled]: content.properti2026,
  };

  const createdArticles: Array<{ id: string; slug: string }> = [];

  for (const def of articleDefs) {
    const articleContent = contentMap[def.id];
    const upsertData = {
      title: def.title,
      excerpt: def.excerpt,
      content: articleContent,
      coverImageUrl: def.coverImageUrl,
      status: def.status,
      visibility: def.visibility,
      readingTime: def.readingTime,
      publishedAt: def.publishedAt,
      scheduledAt: (def as { scheduledAt?: Date }).scheduledAt ?? null,
    };

    const article = await prisma.article.upsert({
      where: { publicationId_slug: { publicationId: publication.id, slug: def.slug } },
      update: upsertData,
      create: {
        id: def.id,
        publicationId: publication.id,
        authorId: def.authorId,
        slug: def.slug,
        ...upsertData,
      },
    });

    // Sync tags
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
    await prisma.articleTag.createMany({
      data: def.tags.map((slug) => ({ articleId: article.id, tagId: tags[slug].id })),
    });

    createdArticles.push({ id: article.id, slug: article.slug });
    const badge =
      def.status === ArticleStatus.draft ? '[draft]    ' :
      def.status === ArticleStatus.scheduled ? '[scheduled]' :
      def.visibility === Visibility.members_only ? '[premium]  ' : '[free]     ';
    console.log(`✓ Article ${badge}: "${def.title.substring(0, 55)}..."`);
  }

  // ── 9. Series ────────────────────────────────────────────────────────────────
  const series = await prisma.series.upsert({
    where: { publicationId_slug: { publicationId: publication.id, slug: 'panduan-investasi-pemula' } },
    update: {
      title: 'Investasi untuk Pemula: Panduan Lengkap dari Nol',
      description:
        'Tiga artikel untuk membangun fondasi investasi yang kuat — dari langkah pertama, menghindari jebakan umum, hingga memahami reksa dana sebagai instrumen ideal pemula.',
      coverImageUrl: COVERS.series,
    },
    create: {
      id: ID.series,
      publicationId: publication.id,
      authorId: pubOwner.id,
      slug: 'panduan-investasi-pemula',
      title: 'Investasi untuk Pemula: Panduan Lengkap dari Nol',
      description:
        'Tiga artikel untuk membangun fondasi investasi yang kuat — dari langkah pertama, menghindari jebakan umum, hingga memahami reksa dana sebagai instrumen ideal pemula.',
      coverImageUrl: COVERS.series,
    },
  });

  await prisma.seriesArticle.deleteMany({ where: { seriesId: series.id } });
  await prisma.seriesArticle.createMany({
    data: [
      { seriesId: series.id, articleId: ID.artFree1, orderIndex: 1 },
      { seriesId: series.id, articleId: ID.artFree2, orderIndex: 2 },
      { seriesId: series.id, articleId: ID.artFree3, orderIndex: 3 },
    ],
  });
  console.log(`✓ Series: "${series.title}" (3 artikel)`);

  // ── 10. Subscriptions ────────────────────────────────────────────────────────
  const calcSub = (price: number, durationMonths: number) => {
    const grossAmount = price * durationMonths;
    const platformFee = Math.round((grossAmount * 15) / 100);
    return { grossAmount, platformFee, netAmount: grossAmount - platformFee };
  };

  // Hapus semua subscription lama untuk publication ini agar idempotent
  await prisma.subscription.deleteMany({ where: { publicationId: publication.id } });

  // member1 — aktif, expires 1 minggu lagi (2026-06-08)
  const sub1 = calcSub(plans[0].price, plans[0].durationMonths);
  await prisma.subscription.create({
    data: {
      publicationId: publication.id,
      userId: member1.id,
      planId: ID.plan1mo,
      status: SubscriptionStatus.active,
      ...sub1,
      paymentId: 'LNT-SEED-M1-001',
      paymentMethod: 'bank_transfer',
      startedAt: new Date('2026-05-08T00:00:00Z'),
      expiresAt: new Date('2026-06-08T00:00:00Z'),
    },
  });

  // member2 — aktif, expires 1 bulan lagi (2026-07-01)
  const sub2 = calcSub(plans[1].price, plans[1].durationMonths);
  await prisma.subscription.create({
    data: {
      publicationId: publication.id,
      userId: member2.id,
      planId: ID.plan3mo,
      status: SubscriptionStatus.active,
      ...sub2,
      paymentId: 'LNT-SEED-M2-001',
      paymentMethod: 'gopay',
      startedAt: new Date('2026-04-01T00:00:00Z'),
      expiresAt: new Date('2026-07-01T00:00:00Z'),
    },
  });

  // member3 — aktif, expires 2 bulan lagi (2026-08-01)
  const sub3 = calcSub(plans[2].price, plans[2].durationMonths);
  await prisma.subscription.create({
    data: {
      publicationId: publication.id,
      userId: member3.id,
      planId: ID.plan6mo,
      status: SubscriptionStatus.active,
      ...sub3,
      paymentId: 'LNT-SEED-M3-001',
      paymentMethod: 'credit_card',
      startedAt: new Date('2026-02-01T00:00:00Z'),
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    },
  });

  // memberExpired — subscription sudah expired (berakhir 30 hari lalu)
  const subExp = calcSub(plans[0].price, plans[0].durationMonths);
  await prisma.subscription.create({
    data: {
      publicationId: publication.id,
      userId: memberExpired.id,
      planId: ID.plan1mo,
      status: SubscriptionStatus.expired,
      ...subExp,
      paymentId: 'LNT-SEED-MEXP-001',
      paymentMethod: 'bank_transfer',
      startedAt: new Date('2026-04-01T00:00:00Z'),
      expiresAt: new Date('2026-05-01T00:00:00Z'),
    },
  });

  // memberFree — tidak punya subscription (akun gratis)
  // tidak dibuat record subscription

  console.log(`✓ Subscriptions   :`);
  console.log(`    ${member1.email}: active (expires 2026-06-08)`);
  console.log(`    ${member2.email}: active (expires 2026-07-01)`);
  console.log(`    ${member3.email}: active (expires 2026-08-01)`);
  console.log(`    ${memberExpired.email}: expired (2026-05-01)`);
  console.log(`    ${memberFree.email}: no subscription (free)`);

  // ── 11. Email Preferences ───────────────────────────────────────────────────
  const emailPrefUsers = [member1, member2, member3, memberExpired, memberFree];
  for (const u of emailPrefUsers) {
    await prisma.emailPreference.upsert({
      where: { userId_publicationId: { userId: u.id, publicationId: publication.id } },
      update: {},
      create: { userId: u.id, publicationId: publication.id, newArticle: true },
    });
  }
  console.log(`✓ Email preferences set for all 5 members`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - now.getTime()) / 1000).toFixed(1);
  console.log(`\n✅ Seed selesai dalam ${elapsed}s!\n`);
  console.log('─'.repeat(60));
  console.log('  PLATFORM');
  console.log('  owner@lentera.id              / PlatformOwner123! [platform_owner]');
  console.log('  admin@lentera.id              / Admin123! [platform_admin]');
  console.log('');
  console.log('  PUBLICATION: investasi-cerdas');
  console.log('  owner@investasicerdas.id      / Owner123! [owner]');
  console.log('  admin-pub@investasicerdas.id  / Admin123! [admin]');
  console.log('  author1@investasicerdas.id    / Author123! [author]');
  console.log('  author2@investasicerdas.id    / Author123! [author]');
  console.log('');
  console.log('  MEMBERS');
  console.log('  member1@example.com           / Member123! [active 1 minggu lagi]');
  console.log('  member2@example.com           / Member123! [active 1 bulan lagi]');
  console.log('  member3@example.com           / Member123! [active 2 bulan lagi]');
  console.log('  member-expired@example.com    / Member123! [expired]');
  console.log('  member-free@example.com       / Member123! [gratis, tanpa subscription]');
  console.log('─'.repeat(60));
  console.log('  URL (dev): http://investasi-cerdas.localhost:3000');
  console.log('  Backend  : http://localhost:4000\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed error:\n', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
