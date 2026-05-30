import { Worker } from 'bullmq';
import { config } from '../../config';
import { resend } from '../../config/email.config';
import { templates } from './email.templates';
import type { EmailJobData } from './email.types';

const bullConnection = { url: config.redis.url, maxRetriesPerRequest: null as unknown as number };

async function processEmailJob(job: { data: EmailJobData }) {
  const { name, data } = job.data;

  let subject = '';
  let html = '';
  let to = '';

  switch (name) {
    case 'send-verification':
      to = data.to;
      subject = 'Verifikasi Email Akun Lentera Kamu';
      html = templates.verification(data.name, data.verifyUrl);
      break;

    case 'send-reset-password':
      to = data.to;
      subject = 'Reset Password Lentera';
      html = templates.resetPassword(data.name, data.resetUrl);
      break;

    case 'send-subscription-confirmed':
      to = data.to;
      subject = `Subscription ${data.publicationName} Berhasil!`;
      html = templates.subscriptionConfirmed(
        data.name,
        data.publicationName,
        data.planDurationMonths,
        data.expiresAt,
      );
      break;

    case 'send-subscription-expiring':
      to = data.to;
      subject = `Subscription ${data.publicationName} Hampir Berakhir`;
      html = templates.subscriptionExpiring(
        data.name,
        data.publicationName,
        data.expiresAt,
        data.renewUrl,
      );
      break;

    case 'send-subscription-expired':
      to = data.to;
      subject = `Subscription ${data.publicationName} Telah Berakhir`;
      html = templates.subscriptionExpired(data.name, data.publicationName, data.resubscribeUrl);
      break;

    case 'send-new-article':
      to = data.to;
      subject = `Artikel Baru: ${data.articleTitle} — ${data.publicationName}`;
      html = templates.newArticle(
        data.name,
        data.publicationName,
        data.articleTitle,
        data.articleExcerpt,
        data.articleUrl,
        data.coverImageUrl,
        data.unsubscribeUrl,
      );
      break;

    case 'send-author-invite':
      to = data.to;
      subject = `Undangan Bergabung ke ${data.publicationName}`;
      html = templates.authorInvite(
        data.publicationName,
        data.invitedBy,
        data.role,
        data.inviteUrl,
      );
      break;

    default:
      throw new Error(`Unknown email job: ${(job.data as { name: string }).name}`);
  }

  const { error } = await resend.emails.send({
    from: config.resend.fromEmail,
    to,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

export function startEmailWorker() {
  const worker = new Worker<EmailJobData>('email', processEmailJob, {
    connection: bullConnection,
  });

  worker.on('completed', (job) => {
    console.log(`[Email] Job ${job.id} (${(job.data as { name: string }).name}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[Email] Job ${job?.id} (${(job?.data as { name: string } | undefined)?.name}) failed:`,
      err.message,
    );
  });

  console.log('[Email] Worker started');
  return worker;
}
