const nodemailer = require('nodemailer');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
  }

  return transporter;
}

async function sendPinEmail(to, pin) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"4H's Shortener" <${process.env.SMTP_USER || 'noreply@4hs.link'}>`,
    to,
    subject: 'Your Password Reset PIN',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; padding: 24px 0;">
          <h2 style="color: #0d6efd; margin: 0;">4H's Shortener</h2>
        </div>
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h3 style="margin-top: 0;">Password Reset Request</h3>
          <p style="color: #666;">Use the PIN below to reset your password. This PIN expires in 10 minutes.</p>
          <div style="text-align: center; padding: 20px 0;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0d6efd; background: #f0f5ff; padding: 12px 24px; border-radius: 8px;">${pin}</span>
          </div>
          <p style="color: #999; font-size: 13px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });

  if (!process.env.SMTP_HOST) {
    console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

async function sendWelcomeEmail(to) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"4H's Shortener" <${process.env.SMTP_USER || 'noreply@4hs.link'}>`,
    to,
    subject: 'Welcome to 4H\'s Shortener!',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; padding: 24px 0;">
          <h2 style="color: #0d6efd; margin: 0;">4H's Shortener</h2>
        </div>
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h3 style="margin-top: 0;">Welcome!</h3>
          <p style="color: #666;">Your account has been created successfully. You can now start shortening URLs, tracking clicks, and generating QR codes.</p>
          <div style="text-align: center; padding: 16px 0;">
            <a href="https://${process.env.APP_URL || 'localhost:3000'}/login"
               style="background: #0d6efd; color: #fff; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; display: inline-block;">
              Sign In
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">If you did not create this account, please ignore this email.</p>
        </div>
      </div>
    `,
  });

  if (!process.env.SMTP_HOST) {
    console.log('[Email] Welcome Preview:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = { sendPinEmail, sendWelcomeEmail };
