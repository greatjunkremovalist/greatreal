export const maxDuration = 60;

const INFO_EMAIL = 'info@greatjunkremovalist.com.au';
const SITE = 'https://www.greatjunkremovalist.com.au';
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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildViewUrl(name, links) {
  if (!links.length) return '';
  const encoded = Buffer.from(JSON.stringify(links), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${SITE}/view-photos?n=${encodeURIComponent(name || 'Customer')}&d=${encoded}`;
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
  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    headers: HOST_HEADERS,
    body: upload,
  });
  const data = await response.json().catch(() => null);
  const page = String(data?.data?.url || '');
  if (!page.startsWith('http')) return '';
  return page.replace('://tmpfiles.org/', '://tmpfiles.org/dl/');
}

async function hostOnCatbox(bytes) {
  const upload = new FormData();
  upload.append('reqtype', 'fileupload');
  upload.append('fileToUpload', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    headers: HOST_HEADERS,
    body: upload,
  });
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

function buildHtmlEmail({ name, email, phone, postcode, service, details, links, viewUrl }) {
  const photosHtml = links.length
    ? `
      <p style="margin:0 0 14px 0;">
        <a href="${escapeHtml(viewUrl)}"
           style="display:inline-block;background:#1a73e8;color:#ffffff;padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none;">
          View all photos
        </a>
      </p>
      ${links
        .map(
          (url, i) =>
            `<p style="margin:0 0 8px 0;"><a href="${escapeHtml(url)}" style="color:#1a73e8;font-size:16px;text-decoration:underline;">Photo ${i + 1}</a></p>`,
        )
        .join('')}`
    : `<p style="margin:0;">No photos</p>`;

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#111;font-size:15px;line-height:1.5;">
  <h2 style="margin:0 0 16px;">New quote</h2>
  <p style="margin:0 0 6px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p style="margin:0 0 6px;"><strong>Email:</strong> <a style="color:#1a73e8;" href="mailto:${escapeHtml(email)}">${escapeHtml(email || 'Not provided')}</a></p>
  <p style="margin:0 0 6px;"><strong>Phone:</strong> <a style="color:#1a73e8;" href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
  <p style="margin:0 0 6px;"><strong>Postcode:</strong> ${escapeHtml(postcode)}</p>
  <p style="margin:0 0 6px;"><strong>Service:</strong> ${escapeHtml(service)}</p>
  <p style="margin:0 0 16px;"><strong>Details:</strong> ${escapeHtml(details)}</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:0 0 16px;" />
  <p style="margin:0 0 10px;"><strong>Photos</strong></p>
  ${photosHtml}
</body></html>`;
}

async function sendHtmlToInfo({ subject, html, text, replyTo }) {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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
    if (!response.ok) throw new Error(await response.text());
    return true;
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
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await readJson(req);
    const photos = Array.isArray(payload.photos) ? payload.photos.filter((p) => p?.data).slice(0, 5) : [];

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

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();
    const postcode = String(payload.postcode || '').trim();
    const service = String(payload.service || 'Not specified').trim();
    const details = String(payload.details || 'No description provided').trim();
    const viewUrl = buildViewUrl(name || 'Customer', links);

    let emailed = false;
    if (name && phone) {
      const subject = `New quote — ${name} (${postcode || 'Melbourne'})`;
      const html = buildHtmlEmail({ name, email, phone, postcode, service, details, links, viewUrl });
      const text = [
        `Name: ${name}`,
        `Email: ${email || 'Not provided'}`,
        `Phone: ${phone}`,
        `Postcode: ${postcode}`,
        `Service: ${service}`,
        `Details: ${details}`,
        `Photos: ${viewUrl || links.join('\n') || 'No photos'}`,
      ].join('\n');

      try {
        emailed = await sendHtmlToInfo({
          subject,
          html,
          text,
          replyTo: email || INFO_EMAIL,
        });
      } catch {
        emailed = false;
      }
    }

    sendJson(res, 200, { ok: true, links, viewUrl, emailed });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not process quote.',
    });
  }
}
