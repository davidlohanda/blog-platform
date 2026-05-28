import { PrismaClient, AuthorRole, ArticleStatus, Visibility } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development data...');

  // 1 Publication
  const publication = await prisma.publication.upsert({
    where: { slug: 'techbites' },
    update: {},
    create: {
      slug: 'techbites',
      name: 'TechBites',
      description: 'Artikel teknologi mendalam untuk developer Indonesia.',
      platformFeePercent: 15,
    },
  });

  // 2 Authors
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Andi Pratama',
      // password: "password123" hashed with Argon2 — generated separately
      emailVerifiedAt: new Date(),
    },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@example.com' },
    update: {},
    create: {
      email: 'author@example.com',
      name: 'Budi Santoso',
      emailVerifiedAt: new Date(),
    },
  });

  // Assign roles
  await prisma.publicationAuthor.upsert({
    where: { publicationId_userId: { publicationId: publication.id, userId: owner.id } },
    update: {},
    create: { publicationId: publication.id, userId: owner.id, role: AuthorRole.owner },
  });

  await prisma.publicationAuthor.upsert({
    where: { publicationId_userId: { publicationId: publication.id, userId: author.id } },
    update: {},
    create: { publicationId: publication.id, userId: author.id, role: AuthorRole.author },
  });

  // 5 Sample Articles
  const articles = [
    {
      slug: 'mengenal-typescript-generics',
      title: 'Mengenal TypeScript Generics: Panduan Lengkap',
      excerpt: 'Generics adalah salah satu fitur paling powerful di TypeScript.',
      visibility: Visibility.free,
    },
    {
      slug: 'arsitektur-microservices-vs-monolith',
      title: 'Microservices vs Monolith: Kapan Harus Memilih?',
      excerpt: 'Panduan memilih arsitektur yang tepat untuk project Anda.',
      visibility: Visibility.free,
    },
    {
      slug: 'postgresql-performance-tuning',
      title: 'PostgreSQL Performance Tuning untuk Aplikasi Skala Besar',
      excerpt: 'Optimasi query dan indexing untuk performa maksimal.',
      visibility: Visibility.members_only,
    },
    {
      slug: 'redis-caching-strategies',
      title: 'Strategi Caching dengan Redis yang Efektif',
      excerpt: 'Pelajari berbagai pattern caching untuk meningkatkan performa.',
      visibility: Visibility.members_only,
    },
    {
      slug: 'nextjs-server-components-deep-dive',
      title: 'Next.js Server Components: Deep Dive',
      excerpt: 'Memahami cara kerja React Server Components di Next.js.',
      visibility: Visibility.free,
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { publicationId_slug: { publicationId: publication.id, slug: article.slug } },
      update: {},
      create: {
        publicationId: publication.id,
        authorId: owner.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        status: ArticleStatus.published,
        visibility: article.visibility,
        publishedAt: new Date(),
        readingTime: Math.floor(Math.random() * 10) + 3,
        content: { type: 'doc', content: [] },
      },
    });
  }

  console.log('Seed complete.');
  console.log(`  Publication: ${publication.slug}`);
  console.log(`  Owner: ${owner.email}`);
  console.log(`  Author: ${author.email}`);
  console.log(`  Articles: ${articles.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
