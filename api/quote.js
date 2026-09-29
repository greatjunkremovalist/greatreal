export const maxDuration = 60;

const INFO_EMAIL = 'info@greatjunkremovalist.com.au';
const HOST_HEADERS = { 'User-Agent': 'Mozilla/5.0' };

function sendJson(res, status, data) {
  if (typeof res.status === 'function') {
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function buildViewUrl(name, links) {
  if (!links.length) return '';
  const json = JSON.stringify(links);
  const encoded = Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `https://www.greatjunkremovalist.com.au/view-photos?n=${encodeURIComponent(name)}&d=${encoded}`;
}

async function hostOnLitterbox(bytes) {
  const upload = new FormData();
  upload.append('reqtype', 'fileupload');
  upload.append('time', '24h');
  upload.append('fileToUpload', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    headers: HOST_HEADERS,
    body: upload,
  });
  const url = (await response.text()).trim();
  return url.startsWith('http') ? url : '';
}

async function hostOnTmpfiles(bytes) {
  const upload = new FormData();
  upload.append('file', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', headers: HOST_HEADERS, body: upload });
  const data = await response.json().catch(() => null);
  const page = String(data?.data?.url || '');
  if (!page.startsWith('http')) return '';
  return page.replace('://tmpfiles.org/', '://tmpfiles.org/dl/');
}

async function hostOnCatbox(bytes) {
  const upload = new FormData();
  upload.append('reqtype', 'fileupload');
  upload.append('fileToUpload', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', headers: HOST_HEADERS, body: upload });
  const url = (await response.text()).trim();
  return url.startsWith('http') ? url : '';
}

async function hostPhoto(bytes) {
  try {
    return await Promise.any(
      [hostOnLitterbox, hostOnTmpfiles, hostOnCatbox].map(async (host) => {
        const url = await host(bytes);
        if (!url) throw new Error('empty');
        return url;
      }),
    );
  } catch {
    return '';
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtmlEmail({ name, email, phone, postcode, service, details, links, viewUrl }) {
  const photoBlock = links.length
    ? `
      <p style="margin:0 0 12px 0;">
        <a href="${escapeHtml(viewUrl)}" style="color:#1a73e8;font-size:16px;font-weight:700;text-decoration:underline;">
          Tap here to view all photos
        </a>
      </p>
      ${links
        .map(
          (url, index) => `
        <p style="margin:0 0 10px 0;">
          <a href="${escapeHtml(url)}" style="color:#1a73e8;font-size:15px;text-decoration:underline;">
            Photo ${index + 1} — tap to open
          </a>
        </p>`,
        )
        .join('')}`
    : `<p style="margin:0;">No photos</p>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111111;">
  <h2 style="margin:0 0 16px 0;font-size:20px;">New quote</h2>
  <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p style="margin:0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#1a73e8;">${escapeHtml(email || 'Not provided')}</a></p>
  <p style="margin:0 0 8px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color:#1a73e8;">${escapeHtml(phone)}</a></p>
  <p style="margin:0 0 8px 0;"><strong>Postcode:</strong> ${escapeHtml(postcode)}</p>
  <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${escapeHtml(service)}</p>
  <p style="margin:0 0 8px 0;"><strong>Details:</strong> ${escapeHtml(details)}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
  <p style="margin:0 0 8px 0;"><strong>Photos:</strong></p>
  ${photoBlock}
</body>
</html>`;
}

async function sendHtmlToInfo({ subject, html, text, replyTo }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.QUOTE_FROM_EMAIL || 'Great Junk Removalist <onboarding@resend.dev>',
        to: [INFO_EMAIL],
        subject,
        html,
        text,
        reply_to: replyTo || undefined,
      }),
    });
    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(`Resend failed: ${err.slice(0, 180)}`);
    }
    return 'resend';
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (user && pass) {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: process.env.QUOTE_FROM_EMAIL || `"Great Junk Removalist" <${user}>`,
      to: INFO_EMAIL,
      subject,
      html,
      text,
      replyTo: replyTo || undefined,
    });
    return 'smtp';
  }

  return '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await readJson(req);
    const photos = Array.isArray(payload.photos) ? payload.photos.filter((photo) => photo?.data).slice(0, 5) : [];

    const links = (
      await Promise.all(
        photos.map(async (photo) => {
          try {
            return await hostPhoto(Buffer.from(photo.data, 'base64'));
          } catch {
            return '';
          }
        }),
      )
    ).filter(Boolean);

    if (photos.length > 0 && links.length === 0) {
      sendJson(res, 502, {
        ok: false,
        error: 'Could not prepare your photo links. Please try smaller images or call 0451 198 226.',
      });
      return;
    }

    // Photos-only request (legacy client)
    if (!payload.name && !payload.phone) {
      sendJson(res, 200, { ok: true, links, emailed: false });
      return;
    }

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();
    const postcode = String(payload.postcode || '').trim();
    const service = String(payload.service || 'Not specified').trim();
    const details = String(payload.details || 'No description provided').trim();
    const viewUrl = String(payload.viewUrl || '').trim() || buildViewUrl(name, links);

    const subject = viewUrl
      ? `New quote — ${name} (${postcode}) — ${viewUrl}`
      : `New quote — ${name} (${postcode})`;
    const html = buildHtmlEmail({ name, email, phone, postcode, service, details, links, viewUrl });
    const text = [
      `Name: ${name}`,
      `Email: ${email || 'Not provided'}`,
      `Phone: ${phone}`,
      `Postcode: ${postcode}`,
      `Service: ${service}`,
      `Details: ${details}`,
      `Photos: ${viewUrl || links.join(' ') || 'No photos'}`,
    ].join('\n');

    let emailed = false;
    let provider = '';
    try {
      provider = await sendHtmlToInfo({
        subject,
        html,
        text,
        replyTo: email || INFO_EMAIL,
      });
      emailed = Boolean(provider);
    } catch {
      emailed = false;
    }

    sendJson(res, 200, { ok: true, links, viewUrl, emailed, provider });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not send quote. Please call 0451 198 226.',
    });
  }
}
