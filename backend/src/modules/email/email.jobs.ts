import { Queue, Worker } from 'bullmq';
import { config } from '../../config';
import { emailService } from './email.service';
import { prisma } from '../../config/database.config';

const bullConnection = { url: config.redis.url, maxRetriesPerRequest: null as unknown as number };

const systemQueue = new Queue('system-jobs', {
  connection: bullConnection,
  defaultJobOptions: { removeOnComplete: 10, removeOnFail: 50 },
});

export async function scheduleRecurringJobs() {
  await Promise.all([
    // Subscription expiry reminder — 08:00 daily
    systemQueue.add(
      'subscription-expiry-reminders',
      {},
      {
        repeat: { pattern: '0 8 * * *' },
        jobId: 'subscription-expiry-reminders',
      },
    ),
    // Publish scheduled articles — every 5 minutes
    systemQueue.add(
      'publish-scheduled-articles',
      {},
      {
        repeat: { pattern: '*/5 * * * *' },
        jobId: 'publish-scheduled-articles',
      },
    ),
    // DNS propagation check for custom domains — every hour
    systemQueue.add(
      'check-custom-domains',
      {},
      {
        repeat: { pattern: '0 * * * *' },
        jobId: 'check-custom-domains',
      },
    ),
  ]);
  console.log('[Jobs] Recurring jobs scheduled');
}

async function publishScheduledArticles() {
  const now = new Date();
  const due = await prisma.article.findMany({
    where: { status: 'scheduled', scheduledAt: { lte: now }, deletedAt: null },
    select: {
      id: true,
      publicationId: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publication: { select: { name: true } },
    },
  });

  for (const article of due) {
    await prisma.article.update({
      where: { id: article.id, publicationId: article.publicationId },
      data: { status: 'published', publishedAt: now },
    });

    // Send new article notification to subscribers
    emailService
      .enqueueNewArticleNotifications(article.publicationId, article.publication.name, {
        title: article.title,
        excerpt: article.excerpt,
        slug: article.slug,
        coverImageUrl: article.coverImageUrl,
      })
      .catch((err: Error) =>
        console.error(`[Jobs] Failed to notify for article ${article.id}:`, err.message),
      );
  }

  return due.length;
}

async function checkCustomDomains() {
  const { lookup } = await import('dns/promises');

  const publications = await prisma.publication.findMany({
    where: { customDomain: { not: null }, customDomainStatus: 'pending' },
    select: { id: true, customDomain: true, slug: true },
  });

  let verified = 0;
  for (const pub of publications) {
    if (!pub.customDomain) continue;
    try {
      const addresses = await lookup(pub.customDomain, { family: 4 });
      // If DNS resolves, mark as verified (CNAME → A record resolution indicates propagation)
      if (addresses) {
        await prisma.publication.update({
          where: { id: pub.id },
          data: { customDomainStatus: 'verified' },
        });
        verified++;
      }
    } catch {
      // DNS lookup failed — domain not yet propagated, keep as 'pending'
    }
  }

  return { checked: publications.length, verified };
}

export function startSystemWorker() {
  const worker = new Worker(
    'system-jobs',
    async (job) => {
      switch (job.name) {
        case 'subscription-expiry-reminders': {
          const count = await emailService.sendExpiryReminders();
          console.log(`[Jobs] Sent ${count} expiry reminder(s)`);
          break;
        }
        case 'publish-scheduled-articles': {
          const count = await publishScheduledArticles();
          if (count > 0) console.log(`[Jobs] Published ${count} scheduled article(s)`);
          break;
        }
        case 'check-custom-domains': {
          const { checked, verified } = await checkCustomDomains();
          if (checked > 0)
            console.log(`[Jobs] DNS check: ${verified}/${checked} domain(s) verified`);
          break;
        }
      }
    },
    { connection: bullConnection },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Jobs] Job ${job?.name} failed:`, err.message);
  });

  return worker;
}
