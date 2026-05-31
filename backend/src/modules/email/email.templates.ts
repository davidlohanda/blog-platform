const base = (content: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background: #18181b; padding: 24px 32px; }
    .header span { color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 32px; color: #3f3f46; font-size: 15px; line-height: 1.6; }
    .body h1 { font-size: 22px; color: #18181b; margin: 0 0 16px; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; padding: 12px 24px; background: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
    .footer { padding: 24px 32px; background: #f4f4f5; font-size: 12px; color: #71717a; text-align: center; }
    .footer a { color: #71717a; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><span>Lentera</span></div>
    <div class="body">${content}</div>
    <div class="footer">
      Lentera — Platform Blog Subscription<br/>
      <a href="https://lentera.id">lentera.id</a>
    </div>
  </div>
</body>
</html>`;

export const templates = {
  verification(name: string, verifyUrl: string) {
    return base(`
      <h1>Verifikasi Email Kamu</h1>
      <p>Halo ${name},</p>
      <p>Terima kasih sudah mendaftar di Lentera. Klik tombol di bawah untuk mengaktifkan akunmu:</p>
      <a href="${verifyUrl}" class="btn">Verifikasi Email</a>
      <p>Link ini berlaku selama <strong>24 jam</strong>. Jika kamu tidak mendaftar, abaikan email ini.</p>
      <hr class="divider"/>
      <p style="font-size:13px;color:#71717a;">Atau salin URL ini ke browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
    `);
  },

  resetPassword(name: string, resetUrl: string) {
    return base(`
      <h1>Reset Password</h1>
      <p>Halo ${name},</p>
      <p>Kami menerima permintaan untuk mereset password akunmu. Klik tombol di bawah untuk melanjutkan:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>Link ini berlaku selama <strong>1 jam</strong>. Jika kamu tidak meminta reset password, abaikan email ini — password kamu tidak akan berubah.</p>
    `);
  },

  subscriptionConfirmed(
    name: string,
    publicationName: string,
    planDurationMonths: number,
    expiresAt: string,
  ) {
    const duration =
      planDurationMonths === 1
        ? '1 bulan'
        : planDurationMonths === 12
          ? '1 tahun'
          : `${planDurationMonths} bulan`;
    return base(`
      <h1>Subscription Berhasil! 🎉</h1>
      <p>Halo ${name},</p>
      <p>Selamat! Kamu kini menjadi member <strong>${publicationName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#71717a;">Paket</td><td style="padding:8px 0;font-weight:600;">${duration}</td></tr>
        <tr><td style="padding:8px 0;color:#71717a;">Aktif hingga</td><td style="padding:8px 0;font-weight:600;">${expiresAt}</td></tr>
      </table>
      <p>Kamu sekarang bisa mengakses semua konten premium. Selamat membaca!</p>
    `);
  },

  subscriptionExpiring(name: string, publicationName: string, expiresAt: string, renewUrl: string) {
    return base(`
      <h1>Subscription Hampir Berakhir</h1>
      <p>Halo ${name},</p>
      <p>Subscription kamu di <strong>${publicationName}</strong> akan berakhir pada <strong>${expiresAt}</strong>.</p>
      <p>Perpanjang sekarang agar kamu tidak kehilangan akses ke konten premium:</p>
      <a href="${renewUrl}" class="btn">Perpanjang Subscription</a>
    `);
  },

  subscriptionExpired(name: string, publicationName: string, resubscribeUrl: string) {
    return base(`
      <h1>Subscription Telah Berakhir</h1>
      <p>Halo ${name},</p>
      <p>Subscription kamu di <strong>${publicationName}</strong> telah berakhir. Kamu tidak lagi bisa mengakses konten premium.</p>
      <p>Berlangganan kembali untuk melanjutkan perjalanan belajarmu:</p>
      <a href="${resubscribeUrl}" class="btn">Berlangganan Lagi</a>
    `);
  },

  newArticle(
    name: string,
    publicationName: string,
    articleTitle: string,
    articleExcerpt: string,
    articleUrl: string,
    coverImageUrl: string | undefined,
    unsubscribeUrl: string,
  ) {
    const cover = coverImageUrl
      ? `<img src="${coverImageUrl}" alt="Cover" style="width:100%;border-radius:4px;margin-bottom:16px;"/>`
      : '';
    return base(`
      <h1>Artikel Baru dari ${publicationName}</h1>
      <p>Halo ${name},</p>
      ${cover}
      <h2 style="font-size:18px;color:#18181b;margin:0 0 8px;">${articleTitle}</h2>
      <p style="color:#71717a;">${articleExcerpt}</p>
      <a href="${articleUrl}" class="btn">Baca Artikel</a>
      <hr class="divider"/>
      <p style="font-size:12px;color:#71717a;">Tidak ingin menerima notifikasi artikel baru? <a href="${unsubscribeUrl}" style="color:#71717a;">Berhenti berlangganan notifikasi</a>.</p>
    `);
  },

  authorInvite(publicationName: string, invitedBy: string, role: string, inviteUrl: string) {
    const roleLabel = role === 'owner' ? 'Owner' : 'Penulis';
    return base(`
      <h1>Undangan Bergabung ke ${publicationName}</h1>
      <p><strong>${invitedBy}</strong> mengundangmu untuk bergabung sebagai <strong>${roleLabel}</strong> di publikasi <strong>${publicationName}</strong> di Lentera.</p>
      <a href="${inviteUrl}" class="btn">Terima Undangan</a>
      <p>Undangan ini berlaku selama <strong>7 hari</strong>. Jika kamu tidak mengenal pengirim, abaikan email ini.</p>
    `);
  },

  ownerInvite(ownerName: string, publicationName: string, inviteUrl: string) {
    return base(`
      <h1>Kamu Diundang Menjadi Owner di Lentera</h1>
      <p>Halo ${ownerName},</p>
      <p>Tim Lentera mengundangmu untuk menjadi <strong>Owner</strong> dari publikasi baru:</p>
      <p style="font-size:20px;font-weight:700;color:#18181b;margin:16px 0;">${publicationName}</p>
      <p>Klik tombol di bawah untuk membuat akun dan langsung mulai mengelola publikasimu:</p>
      <a href="${inviteUrl}" class="btn">Mulai Sekarang</a>
      <p>Link ini berlaku selama <strong>7 hari</strong>. Jika kamu tidak merasa mendaftar, abaikan email ini.</p>
      <hr class="divider"/>
      <p style="font-size:13px;color:#71717a;">Atau salin URL ini ke browser:<br/><a href="${inviteUrl}">${inviteUrl}</a></p>
    `);
  },
};
