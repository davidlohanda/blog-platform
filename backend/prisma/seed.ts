import {
  PrismaClient,
  AuthorRole,
  ArticleStatus,
  Visibility,
  SubscriptionStatus,
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

function doc(...nodes: TiptapNode[]): TiptapNode {
  return { type: 'doc', content: nodes };
}

// ─── Fixed UUIDs untuk idempotency ──────────────────────────────────────────
const ID = {
  plan1mo:  '11111111-1111-1111-1111-111111111101',
  plan3mo:  '11111111-1111-1111-1111-111111111103',
  plan6mo:  '11111111-1111-1111-1111-111111111106',
  plan12mo: '11111111-1111-1111-1111-111111111112',
  tagMenulis:       '22222222-2222-2222-2222-222222222201',
  tagMembaca:       '22222222-2222-2222-2222-222222222202',
  tagProduktivitas: '22222222-2222-2222-2222-222222222203',
  series: '44444444-4444-4444-4444-444444444401',
};

// ─── Konten artikel (Tiptap JSON) ────────────────────────────────────────────
const articleContents = {
  membacaSuperpower: doc(
    p(
      'Di era notifikasi yang tidak pernah berhenti dan konten pendek yang mengalir tanpa henti, ',
      'kemampuan membaca secara mendalam semakin langka. Tapi justru di sinilah letak nilainya: ',
      'mereka yang masih bisa duduk, fokus, dan menyerap satu buku secara penuh ',
      'memiliki keunggulan yang sulit direplikasi.'
    ),
    h2('Apa yang Terjadi di Otak Saat Kita Membaca?'),
    p(
      'Saat kita membaca teks naratif yang panjang, otak tidak hanya memproses kata. ',
      'Neuron di korteks somatosensori menyala seolah tubuh kita ikut merasakan apa yang dibaca. ',
      'Ini yang disebut ',
      italic('narrative transportation'),
      ' — kondisi di mana pembaca "masuk" ke dalam cerita atau argumen, bukan sekadar memindai informasi.'
    ),
    p(
      'Berbeda dengan menonton video atau membaca thread pendek, membaca buku melatih otak untuk ',
      'menahan satu jalur pemikiran dalam waktu lama. Inilah yang membentuk kemampuan konsentrasi ',
      'dan analisis mendalam — dua keterampilan yang paling dicari di dunia kerja modern.'
    ),
    h2('Membaca vs. Menonton: Bukan Soal Lebih Baik, Tapi Soal Tujuan'),
    p(
      'Video penjelasan memang lebih efisien untuk prosedur dan demonstrasi visual. ',
      'Tapi untuk memahami argumen yang kompleks, nuansa filsafat, atau membangun kerangka berpikir baru, ',
      'teks yang padat tetap tidak tergantikan. Penulis yang baik memaksa kamu untuk aktif berpikir, ',
      'bukan sekadar menerima.'
    ),
    h2('Cara Mulai (atau Kembali) Membaca'),
    ul(
      'Tetapkan satu slot 20 menit per hari — bukan "nanti kalau sempat"',
      'Pilih buku yang benar-benar ingin kamu baca, bukan yang seharusnya kamu baca',
      'Baca fisik atau e-ink reader — layar ponsel penuh distraksi',
      'Buat catatan pendek: satu kalimat per bab yang paling berkesan',
    ),
    p(
      bold('Ingat:'),
      ' membaca bukan kompetisi. Satu buku yang benar-benar dipahami lebih bernilai ',
      'dari dua puluh buku yang hanya dihabiskan halamannya.'
    ),
  ),

  menulisBerpikir: doc(
    p(
      'Ada miskonsepsi umum bahwa menulis adalah cara untuk mencatat apa yang sudah kita pikirkan. ',
      'Padahal sebaliknya: menulis ',
      italic('adalah'),
      ' cara berpikir itu sendiri. Kamu tidak menulis karena sudah paham. ',
      'Kamu menulis supaya paham.'
    ),
    h2('Efek Menulis Ekspresif pada Kejernihan Pikiran'),
    p(
      'Sejak penelitian James Pennebaker di tahun 1980-an, sudah ratusan studi mengkonfirmasi ',
      'bahwa menulis secara ekspresif — tentang apa yang kamu rasakan dan pikirkan — ',
      'secara signifikan meningkatkan kejernihan pikiran, mengurangi kecemasan, dan bahkan ',
      'memperkuat sistem imun. Ini bukan metafora. Ini fisiologi.'
    ),
    p(
      'Ketika kamu menuangkan pikiran ke halaman, otak prefrontal yang bertanggung jawab atas ',
      'pemrosesan logis menjadi lebih aktif. Kamu memaksa dirimu untuk memberi ',
      italic('struktur'),
      ' pada sesuatu yang sebelumnya hanya berputar-putar sebagai noise di kepala.'
    ),
    h2('Jurnal Harian: Bukan Diary Remaja'),
    p(
      'Kesalahpahaman terbesar tentang jurnal adalah membayangkannya sebagai diary bergambar bunga. ',
      'Jurnal yang efektif lebih mirip ruang kerja pikiran — tempat kamu mengurai masalah, ',
      'menguji asumsi, dan merumuskan keputusan. Banyak CEO, ilmuwan, dan seniman terbesar ',
      'dalam sejarah adalah penjurnal yang konsisten: Darwin, Einstein, Frida Kahlo, Richard Feynman.'
    ),
    h2('Mulai dari Lima Menit'),
    p(
      'Tidak perlu satu jam. Tidak perlu prosa yang indah. Cobalah teknik ini selama tujuh hari: ',
      'setiap pagi, tulis selama tepat lima menit tanpa berhenti. Apa saja. ',
      'Keluhkan cuaca, tulis rencana, atau tulis bahwa kamu tidak tahu harus menulis apa. ',
      'Yang penting tanganmu bergerak.'
    ),
    p(
      'Setelah tujuh hari, baca ulang apa yang kamu tulis. Kamu akan menemukan pola — ',
      'kekhawatiran yang berulang, ide yang tersembunyi, atau keputusan yang sebenarnya ',
      'sudah kamu buat jauh sebelum kamu sadar.'
    ),
  ),

  kebiasaanMenulis: doc(
    p(
      'Hampir setiap orang yang ingin menjadi penulis pernah membuat janji yang sama: ',
      '"Mulai besok, aku akan menulis setiap hari." Dan hampir semua dari mereka ',
      'sudah berhenti di minggu pertama. Bukan karena tidak berbakat. ',
      'Bukan karena tidak punya waktu. Tapi karena sistemnya salah dari awal.'
    ),
    h2('Masalah dengan Motivasi sebagai Fondasi'),
    p(
      'Motivasi adalah bahan bakar yang tidak bisa diandalkan. Ia datang dalam gelombang, ',
      'dan lebih sering tidak datang saat kamu paling membutuhkannya. ',
      'Penulis profesional tidak menulis karena terinspirasi — mereka menulis karena itu pekerjaan mereka. ',
      'Dan pekerjaan dikerjakan setiap hari, tidak peduli suasana hati.'
    ),
    p(
      'Solusinya bukan mencari lebih banyak motivasi. Solusinya adalah merancang sistem ',
      'yang membuat menulis menjadi lebih mudah daripada tidak menulis.'
    ),
    h2('Prinsip Minimum Viable Writing Session'),
    p(
      'Tetapkan target yang terasa keterlaluan kecilnya: satu paragraf. Dua ratus kata. ',
      'Lima belas menit. Tujuannya bukan produktivitas maksimum — tujuannya adalah ',
      bold('tidak pernah melewatkan satu hari pun'),
      '. Konsistensi kecil selama 30 hari lebih kuat dari sprint intensif yang berakhir burnout.'
    ),
    h2('Rancang Lingkungan, Bukan Hanya Niat'),
    p(
      'James Clear dalam ',
      italic('Atomic Habits'),
      ' menjelaskan bahwa perilaku terbentuk lebih banyak oleh lingkungan daripada kemauan keras. ',
      'Jika kamu harus membuka laptop, mencari dokumen, dan menutup semua tab sebelum menulis, ',
      'hambatannya sudah terlalu besar sebelum mulai.'
    ),
    ul(
      'Siapkan dokumen tulisanmu sebelum tidur — buka langsung saat bangun',
      'Tentukan satu tempat khusus untuk menulis, dan hanya untuk menulis',
      'Matikan notifikasi; gunakan mode focus atau aplikasi seperti Cold Turkey',
      'Letakkan catatan ide di samping tempat tidur — tangkap pikiran sebelum hilang',
    ),
    h2('Protokol 30 Hari'),
    p(
      bold('Minggu 1 (Hari 1–7):'),
      ' Cukup buka dokumen dan tulis satu kalimat. Satu. Hitung sebagai sukses. ',
      'Tujuannya membangun identitas: "Aku adalah orang yang menulis setiap hari."'
    ),
    p(
      bold('Minggu 2 (Hari 8–14):'),
      ' Naikkan target ke satu paragraf. Jika mengalir lebih jauh, bagus. Jika tidak, sudah cukup.'
    ),
    p(
      bold('Minggu 3–4 (Hari 15–30):'),
      ' Tambahkan sesi review singkat: baca tulisan kemarin sebelum mulai menulis hari ini. ',
      'Ini membangun momentum dan melatih kemampuan revisi secara alami.'
    ),
    p(
      'Di hari ke-31, kamu tidak akan terasa seperti penulis berbeda. Tapi lihat apa yang sudah kamu hasilkan. ',
      'Tiga puluh hari tulisan, sekecil apapun, adalah lebih nyata dari semua rencana yang tidak pernah dimulai.'
    ),
  ),
};

// ─── Main seed ───────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 Seeding Lentera development data...\n');

  // Password hashing
  const [ownerHash, memberHash] = await Promise.all([
    argon2.hash('Admin123!'),
    argon2.hash('Member123!'),
  ]);

  // ── 1. Publication ──────────────────────────────────────────────────────────
  const publication = await prisma.publication.upsert({
    where: { slug: 'lentera' },
    update: {
      name: 'Lentera',
      description:
        'Ruang baca dan tulis untuk siapa saja yang percaya bahwa kata-kata bisa mengubah cara pandang.',
    },
    create: {
      slug: 'lentera',
      name: 'Lentera',
      description:
        'Ruang baca dan tulis untuk siapa saja yang percaya bahwa kata-kata bisa mengubah cara pandang.',
      platformFeePercent: 15,
    },
  });
  console.log(`✓ Publication: ${publication.name} (${publication.slug})`);

  // ── 2. Users ────────────────────────────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { email: 'admin@lentera.id' },
    update: { passwordHash: ownerHash, name: 'Anya Permata', emailVerifiedAt: new Date() },
    create: {
      email: 'admin@lentera.id',
      name: 'Anya Permata',
      passwordHash: ownerHash,
      bio: 'Penulis dan pembaca buku sejak usia delapan tahun. Percaya bahwa tulisan yang baik bisa mengubah cara seseorang melihat dunia.',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Owner: ${owner.email}`);

  const member = await prisma.user.upsert({
    where: { email: 'member@lentera.id' },
    update: { passwordHash: memberHash, emailVerifiedAt: new Date() },
    create: {
      email: 'member@lentera.id',
      name: 'Budi Santoso',
      passwordHash: memberHash,
      bio: 'Pembaca setia yang sedang belajar merangkai kata.',
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Member: ${member.email}`);

  // ── 3. Publication Author ───────────────────────────────────────────────────
  await prisma.publicationAuthor.upsert({
    where: { publicationId_userId: { publicationId: publication.id, userId: owner.id } },
    update: { role: AuthorRole.owner },
    create: { publicationId: publication.id, userId: owner.id, role: AuthorRole.owner },
  });
  console.log(`✓ Author role: owner → ${owner.email}`);

  // ── 4. Subscription Plans ───────────────────────────────────────────────────
  // Harga per bulan (bukan total); total = price × durationMonths
  const plans = [
    { id: ID.plan1mo,  durationMonths: 1,  price: 49000, label: '1 bulan' },
    { id: ID.plan3mo,  durationMonths: 3,  price: 40000, label: '3 bulan' },
    { id: ID.plan6mo,  durationMonths: 6,  price: 35000, label: '6 bulan' },
    { id: ID.plan12mo, durationMonths: 12, price: 29000, label: '12 bulan' },
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

  // Deactivate any orphan plans tidak termasuk 4 di atas
  await prisma.subscriptionPlan.updateMany({
    where: {
      publicationId: publication.id,
      id: { notIn: [ID.plan1mo, ID.plan3mo, ID.plan6mo, ID.plan12mo] },
    },
    data: { isActive: false },
  });
  console.log(`✓ Subscription plans: ${plans.map((p) => p.label).join(', ')}`);

  // ── 5. Tags ─────────────────────────────────────────────────────────────────
  const tagMenulis = await prisma.tag.upsert({
    where: { publicationId_slug: { publicationId: publication.id, slug: 'menulis' } },
    update: {},
    create: { id: ID.tagMenulis, publicationId: publication.id, name: 'Menulis', slug: 'menulis' },
  });

  const tagMembaca = await prisma.tag.upsert({
    where: { publicationId_slug: { publicationId: publication.id, slug: 'membaca' } },
    update: {},
    create: { id: ID.tagMembaca, publicationId: publication.id, name: 'Membaca', slug: 'membaca' },
  });

  const tagProduktivitas = await prisma.tag.upsert({
    where: { publicationId_slug: { publicationId: publication.id, slug: 'produktivitas' } },
    update: {},
    create: { id: ID.tagProduktivitas, publicationId: publication.id, name: 'Produktivitas', slug: 'produktivitas' },
  });
  console.log(`✓ Tags: Menulis, Membaca, Produktivitas`);

  // ── 6. Articles ─────────────────────────────────────────────────────────────
  const articleDefs = [
    {
      slug: 'mengapa-membaca-adalah-superpower',
      title: 'Mengapa Membaca Adalah Superpower yang Sering Diabaikan',
      excerpt:
        'Di era konten pendek dan notifikasi tanpa henti, kemampuan membaca mendalam menjadi keunggulan yang semakin langka — dan semakin berharga.',
      visibility: Visibility.free,
      readingTime: 5,
      content: articleContents.membacaSuperpower,
      tags: [tagMembaca.id, tagProduktivitas.id],
    },
    {
      slug: 'menulis-untuk-berpikir',
      title: 'Menulis untuk Berpikir: Mengapa Jurnal Harian Mengubah Cara Kerja Otak',
      excerpt:
        'Kamu tidak menulis karena sudah paham. Kamu menulis supaya paham. Inilah sains di balik kenapa menulis ekspresif membuat pikiran menjadi lebih jernih.',
      visibility: Visibility.free,
      readingTime: 6,
      content: articleContents.menulisBerpikir,
      tags: [tagMenulis.id, tagProduktivitas.id],
    },
    {
      slug: 'membangun-kebiasaan-menulis-30-hari',
      title: 'Membangun Kebiasaan Menulis Harian: Sistem 30 Hari yang Terbukti Berhasil',
      excerpt:
        'Motivasi itu tidak bisa diandalkan. Yang bisa diandalkan adalah sistem. Panduan lengkap membangun kebiasaan menulis yang bertahan — khusus untuk member Lentera.',
      visibility: Visibility.members_only,
      readingTime: 9,
      content: articleContents.kebiasaanMenulis,
      tags: [tagMenulis.id, tagMembaca.id, tagProduktivitas.id],
    },
  ];

  const publishedAt = new Date('2026-05-01T08:00:00Z');
  const createdArticles = [];

  for (let i = 0; i < articleDefs.length; i++) {
    const def = articleDefs[i];
    const article = await prisma.article.upsert({
      where: { publicationId_slug: { publicationId: publication.id, slug: def.slug } },
      update: {
        title: def.title,
        excerpt: def.excerpt,
        content: def.content,
        status: ArticleStatus.published,
        visibility: def.visibility,
        readingTime: def.readingTime,
        publishedAt: new Date(publishedAt.getTime() + i * 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        publicationId: publication.id,
        authorId: owner.id,
        title: def.title,
        slug: def.slug,
        excerpt: def.excerpt,
        content: def.content,
        status: ArticleStatus.published,
        visibility: def.visibility,
        readingTime: def.readingTime,
        publishedAt: new Date(publishedAt.getTime() + i * 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Sync tags: hapus yang lama, tambah yang baru
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
    await prisma.articleTag.createMany({
      data: def.tags.map((tagId) => ({ articleId: article.id, tagId })),
    });

    createdArticles.push(article);
    const badge = def.visibility === Visibility.members_only ? '[premium]' : '[free]  ';
    console.log(`✓ Article ${badge}: "${def.title}"`);
  }

  // ── 7. Series ────────────────────────────────────────────────────────────────
  const series = await prisma.series.upsert({
    where: { publicationId_slug: { publicationId: publication.id, slug: 'seni-membaca-dan-menulis' } },
    update: { title: 'Seni Membaca dan Menulis', description: 'Tiga esai untuk membangun hubungan yang lebih baik dengan kata-kata — baik sebagai pembaca maupun penulis.' },
    create: {
      id: ID.series,
      publicationId: publication.id,
      authorId: owner.id,
      title: 'Seni Membaca dan Menulis',
      slug: 'seni-membaca-dan-menulis',
      description:
        'Tiga esai untuk membangun hubungan yang lebih baik dengan kata-kata — baik sebagai pembaca maupun penulis.',
    },
  });

  // Hapus semua series articles lama, recreate dengan urutan yang benar
  await prisma.seriesArticle.deleteMany({ where: { seriesId: series.id } });
  await prisma.seriesArticle.createMany({
    data: createdArticles.map((article, index) => ({
      seriesId: series.id,
      articleId: article.id,
      orderIndex: index + 1,
    })),
  });
  console.log(`✓ Series: "${series.title}" (${createdArticles.length} artikel)`);

  // ── 8. Member Subscription (active) ─────────────────────────────────────────
  // Hapus subscription lama untuk member ini di publication ini, lalu buat baru
  await prisma.subscription.deleteMany({
    where: { userId: member.id, publicationId: publication.id },
  });

  const plan1mo = plans[0];
  const grossAmount = plan1mo.price * plan1mo.durationMonths;
  const platformFee = Math.round((grossAmount * 15) / 100);
  const startedAt = new Date('2026-05-15T00:00:00Z');
  const expiresAt = new Date('2026-06-15T00:00:00Z');

  await prisma.subscription.create({
    data: {
      publicationId: publication.id,
      userId: member.id,
      planId: ID.plan1mo,
      status: SubscriptionStatus.active,
      grossAmount,
      platformFee,
      netAmount: grossAmount - platformFee,
      paymentId: `LNT-SEED-MEMBER-001`,
      paymentMethod: 'bank_transfer',
      startedAt,
      expiresAt,
    },
  });
  console.log(
    `✓ Subscription: ${member.email} → active (${startedAt.toISOString().slice(0, 10)} s/d ${expiresAt.toISOString().slice(0, 10)})`,
  );

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed selesai!\n');
  console.log('  Login sebagai owner  : admin@lentera.id   / Admin123!');
  console.log('  Login sebagai member : member@lentera.id  / Member123!');
  console.log('  Publication URL      : http://lentera.localhost:3000');
  console.log('  Backend              : http://localhost:4000\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed error:\n', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
