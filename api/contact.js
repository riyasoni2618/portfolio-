// api/contact.js
// Dual-purpose: works both as a Vercel/Netlify Serverless function and an Express route handler.

const nodemailer = require('nodemailer');

// In-memory sliding rate-limit tracker (key: IP, value: array of timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Clean up stale rate-limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recent);
    }
  }
}, 15 * 60 * 1000).unref();

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

module.exports = async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Extract client IP (handle proxies & Vercel headers)
  const clientIp =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // Apply rate limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few minutes before trying again.'
    });
  }

  try {
    const { name, email, phone, subject, message, _gotcha } = req.body || {};

    // 1. Anti-spam Honeypot Check: if bot fills hidden input, pretend success without sending
    if (_gotcha) {
      return res.status(200).json({
        success: true,
        message: 'Thanks for reaching out! Your message has been sent successfully.'
      });
    }

    // 2. Input Validation
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanSubject = (subject || 'General Inquiry').trim();
    const cleanMessage = (message || '').trim();

    if (!cleanName || cleanName.length < 1 || cleanName.length > 100) {
      return res.status(400).json({ success: false, error: 'Please enter a valid name (1-100 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!cleanMessage || cleanMessage.length < 2 || cleanMessage.length > 5000) {
      return res.status(400).json({ success: false, error: 'Please write a message between 2 and 5000 characters.' });
    }

    const recipientEmail = process.env.CONTACT_EMAIL || 'riyaasoni178@gmail.com';
    const emailApiKey = (process.env.EMAIL_API_KEY || '').trim();
    const emailFrom = (process.env.EMAIL_FROM || 'onboarding@resend.dev').trim();

    const emailSubject = `Portfolio Contact: [${cleanSubject}] from ${cleanName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1f2426; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: rgb(240, 160, 226);">New Portfolio Message</h2>
        </div>
        <div style="padding: 24px;">
          <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></p>
          ${cleanPhone ? `<p><strong>Phone:</strong> ${escapeHtml(cleanPhone)}</p>` : ''}
          <p><strong>Subject:</strong> ${escapeHtml(cleanSubject)}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${escapeHtml(cleanMessage)}</div>
        </div>
        <div style="background: #f4f4f4; padding: 12px 24px; font-size: 12px; color: #777; text-align: center;">
          Sent from Riya Soni's Portfolio Website Contact Form
        </div>
      </div>
    `;

    // 3. Email Delivery Strategy
    // A) Resend API (default transactional email)
    if (emailApiKey && (emailApiKey.startsWith('re_') || !process.env.SMTP_USER)) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [recipientEmail],
          reply_to: cleanEmail,
          subject: emailSubject,
          html: emailHtml
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Email Delivery Error via Resend]:', errorData);
        return res.status(500).json({
          success: false,
          error: 'Something went wrong while sending your message. Please try again.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Thanks for reaching out! Your message has been sent successfully.'
      });
    }

    // B) SendGrid API (if key starts with SG.)
    if (emailApiKey && emailApiKey.startsWith('SG.')) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipientEmail }] }],
          from: { email: emailFrom },
          reply_to: { email: cleanEmail },
          subject: emailSubject,
          content: [{ type: 'text/html', value: emailHtml }]
        })
      });

      if (!response.ok) {
        console.error('[Email Delivery Error via SendGrid]: Status', response.status);
        return res.status(500).json({
          success: false,
          error: 'Something went wrong while sending your message. Please try again.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Thanks for reaching out! Your message has been sent successfully.'
      });
    }

    // C) SMTP Transport (e.g. Gmail App Password)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"${cleanName}" <${process.env.SMTP_USER}>`,
        replyTo: cleanEmail,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml
      });

      return res.status(200).json({
        success: true,
        message: 'Thanks for reaching out! Your message has been sent successfully.'
      });
    }

    // D) Development Mode fallback: If neither API key nor SMTP is configured
    console.log('\n========================================');
    console.log('📬 [PORTFOLIO CONTACT FORM - DEV MODE]');
    console.log(`To: ${recipientEmail}`);
    console.log(`From: ${cleanName} <${cleanEmail}>`);
    if (cleanPhone) console.log(`Phone: ${cleanPhone}`);
    console.log(`Subject: ${cleanSubject}`);
    console.log(`Message:\n${cleanMessage}`);
    console.log('----------------------------------------');
    console.log('ℹ️ To send live emails to your inbox:');
    console.log('   Add your EMAIL_API_KEY (from resend.com) to .env');
    console.log('========================================\n');

    return res.status(200).json({
      success: true,
      message: 'Thanks for reaching out! Your message has been sent successfully.'
    });

  } catch (err) {
    console.error('[Server Error in Contact API]:', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while sending your message. Please try again.'
    });
  }
};
