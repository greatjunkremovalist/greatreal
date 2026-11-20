import { storeQuotePhoto } from './quote-photo.js';

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
  upload.append('time', '72h');
  upload.append('fileToUpload', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    headers: HOST_HEADERS,
    body: upload,
  });
  const url = (await response.text()).trim();
  return url.startsWith('http') ? url : '';
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

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(''), ms)),
  ]);
}

async function hostPhoto(bytes) {
  try {
    const lasting = await storeQuotePhoto(bytes);
    if (lasting) return lasting;
  } catch {
    // Fall through to 72-hour public hosts if the database cannot save the file.
  }
  for (const host of [hostOnLitterbox, hostOnCatbox]) {
    try {
      const url = await withTimeout(host(bytes), 8000);
      if (url) return url;
    } catch {
      // try next host
    }
  }
  return '';
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
  <!--INLINE_PHOTOS-->
</body></html>`;
}

function buildPhotoAttachments(photoBuffers) {
  const buffers = Array.isArray(photoBuffers) ? photoBuffers : [];
  return buffers.map((buf, index) => ({
    filename: buffers.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg',
    content: Buffer.from(buf, 'base64'),
    contentType: 'image/jpeg',
    cid: `photo${index}@greatjunk`,
  }));
}

function withInlinePhotos(html, attachments) {
  if (!attachments.length) return html;
  const inline = attachments
    .map(
      (att, index) =>
        `<p style="margin:12px 0 0;"><img src="cid:${att.cid}" alt="Photo ${index + 1}" style="max-width:100%;border-radius:8px;" /></p>`,
    )
    .join('');
  return html.replace('<!--INLINE_PHOTOS-->', inline);
}

async function sendWithTransporter({ transporter, from, subject, html, text, replyTo, attachments }) {
  await transporter.sendMail({
    from,
    to: INFO_EMAIL,
    subject,
    html: withInlinePhotos(html, attachments),
    text,
    replyTo: replyTo || undefined,
    attachments,
  });
  return true;
}

async function sendHtmlToInfo({ subject, html, text, replyTo, photoBuffers }) {
  const nodemailer = await import('nodemailer');
  const attachments = buildPhotoAttachments(photoBuffers);

  // 1) Prefer Titan / info@ business mailbox
  const titanUser = process.env.SMTP_USER || process.env.TITAN_SMTP_USER || INFO_EMAIL;
  const titanPass = process.env.SMTP_PASS || process.env.TITAN_SMTP_PASS;
  if (titanPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.titan.email',
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
        auth: { user: titanUser, pass: titanPass },
      });
      return await sendWithTransporter({
        transporter,
        from: process.env.QUOTE_FROM_EMAIL || `"Great Junk Removalist" <${INFO_EMAIL}>`,
        subject,
        html,
        text,
        replyTo,
        attachments,
      });
    } catch {
      // Fall through to Gmail SMTP.
    }
  }

  // 2) Gmail SMTP also (App Password) — branded From name, delivers to info@
  const gmailUser =
    process.env.GMAIL_SMTP_USER || process.env.GMAIL_USER || 'yogeshmehta8950@gmail.com';
  const gmailPass = process.env.GMAIL_SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (gmailPass) {
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.GMAIL_SMTP_PORT || 465),
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });
    return sendWithTransporter({
      transporter,
      from: `"Great Junk Removalist" <${gmailUser}>`,
      subject,
      html,
      text,
      replyTo: replyTo || INFO_EMAIL,
      attachments,
    });
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
      const html = buildHtmlEmail({
        name,
        email,
        phone,
        postcode,
        service,
        details,
        links,
        viewUrl,
      });
      const text = [
        `Name: ${name}`,
        `Email: ${email || 'Not provided'}`,
        `Phone: ${phone}`,
        `Postcode: ${postcode}`,
        `Service: ${service}`,
        `Details: ${details}`,
        `Junk_Pics:`,
        ...(links.length ? links : ['No photos']),
      ].join('\n');

      try {
        emailed = await sendHtmlToInfo({
          subject,
          html,
          text,
          replyTo: email || INFO_EMAIL,
          photoBuffers: photos.map((photo) => photo.data),
        });
      } catch {
        emailed = false;
      }
    }

    // Return lasting photo URLs for the email (site links, not 1-hour temp files).
    sendJson(res, 200, {
      ok: true,
      links,
      viewUrl,
      emailed,
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not process quote.',
    });
  }
}
