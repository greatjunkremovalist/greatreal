export const maxDuration = 60;

const QUOTE_RECIPIENTS = ['info@greatjunkremovalist.com.au', 'yogeshmehta8950@gmail.com'];
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
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Matches the Tally notification layout: bold label, value under it, image.jpg links. */
function buildTallyHtml({ name, email, phone, postcode, service, details, links }) {
  const junkPics = links.length
    ? links
        .map(
          (url) =>
            `<a href="${escapeHtml(url)}" style="color:#1a73e8;text-decoration:underline;">image.jpg</a>`,
        )
        .join('<br>')
    : 'No photos';

  const emailValue = email
    ? `<a href="mailto:${escapeHtml(email)}" style="color:#1a73e8;text-decoration:underline;">${escapeHtml(email)}</a>`
    : 'Not provided';

  const row = (label, value) =>
    `<div style="margin:0 0 18px 0;">` +
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#111111;line-height:1.4;">${label}</div>` +
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:400;color:#111111;line-height:1.5;margin-top:2px;">${value}</div>` +
    `</div>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="max-width:560px;margin:0;padding:8px 4px 8px 12px;border-left:2px solid #c7c7c7;background:#ffffff;">
    ${row('Name', escapeHtml(name))}
    ${row('Email', emailValue)}
    ${row('Phone_10_Digit_Number_', escapeHtml(phone))}
    ${row('Postcode', escapeHtml(postcode))}
    ${row('What do you need removed?', escapeHtml(service))}
    ${row('Junk Pics', junkPics)}
    ${row('Details of Your Junk', escapeHtml(details).replace(/\n/g, '<br>'))}
  </div>
</body>
</html>`;
}

function buildTallyText({ name, email, phone, postcode, service, details, links }) {
  const junkPics = links.length ? links.map(() => 'image.jpg').join('\n') + '\n' + links.join('\n') : 'No photos';
  return [
    'Name',
    name,
    '',
    'Email',
    email || 'Not provided',
    '',
    'Phone_10_Digit_Number_',
    phone,
    '',
    'Postcode',
    postcode,
    '',
    'What do you need removed?',
    service,
    '',
    'Junk Pics',
    junkPics,
    '',
    'Details of Your Junk',
    details,
  ].join('\n');
}

async function hostOnCatbox(bytes) {
  const upload = new FormData();
  upload.append('reqtype', 'fileupload');
  upload.append('fileToUpload', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', headers: HOST_HEADERS, body: upload });
  const url = (await response.text()).trim();
  return url.startsWith('http') ? url : '';
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

async function hostOnZeroX(bytes) {
  const upload = new FormData();
  upload.append('file', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const response = await fetch('https://0x0.st', { method: 'POST', headers: HOST_HEADERS, body: upload });
  const url = (await response.text()).trim();
  return url.startsWith('http') ? url : '';
}

async function hostPhoto(bytes) {
  const hosts = [hostOnLitterbox, hostOnCatbox, hostOnZeroX, hostOnTmpfiles];
  for (const host of hosts) {
    try {
      const url = await host(bytes);
      if (url) return url;
    } catch {
      // Try the next host.
    }
  }
  return '';
}

async function sendWithResend({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const from =
    process.env.QUOTE_FROM_EMAIL ||
    'Great Junk Removalist <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo || undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Resend email failed (${response.status}): ${errText.slice(0, 200)}`);
  }
  return true;
}

async function sendWithSmtp({ to, subject, html, text, replyTo }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return false;

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.QUOTE_FROM_EMAIL || `"Great Junk Removalist" <${user}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text,
    replyTo: replyTo || undefined,
  });
  return true;
}

async function sendTallyQuoteEmail(payload) {
  const html = buildTallyHtml(payload);
  const text = buildTallyText(payload);
  const subject = `Quote request from ${payload.name}`;
  const replyTo = payload.email || undefined;

  if (await sendWithResend({ to: QUOTE_RECIPIENTS, subject, html, text, replyTo })) {
    return 'resend';
  }
  if (await sendWithSmtp({ to: QUOTE_RECIPIENTS, subject, html, text, replyTo })) {
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
    const links = [];
    for (const photo of photos) {
      const url = await hostPhoto(Buffer.from(photo.data, 'base64'));
      if (url) links.push(url);
    }

    if (photos.length > 0 && links.length === 0) {
      sendJson(res, 502, {
        ok: false,
        error: 'Could not prepare your photo links. Please try smaller images or call 0451 198 226.',
      });
      return;
    }

    const quote = {
      name: String(payload.name || '').trim(),
      email: String(payload.email || '').trim(),
      phone: String(payload.phone || '').trim(),
      postcode: String(payload.postcode || '').trim(),
      service: String(payload.service || 'Not specified').trim(),
      details: String(payload.details || 'No description provided').trim(),
      links,
    };

    let emailed = false;
    let provider = '';
    if (quote.name && quote.phone && quote.postcode) {
      provider = await sendTallyQuoteEmail(quote);
      emailed = Boolean(provider);
    }

    sendJson(res, 200, { ok: true, links, emailed, provider });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not prepare your photos. Please call 0451 198 226.',
    });
  }
}
