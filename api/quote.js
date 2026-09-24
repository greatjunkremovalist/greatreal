const RECIPIENTS = ['info@greatjunkremovalist.com.au', 'yogeshmehta8950@gmail.com'];

export const maxDuration = 60;

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

async function hostPhoto(bytes) {
  const upload = new FormData();
  upload.append('reqtype', 'fileupload');
  upload.append('fileToUpload', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: upload,
      signal: controller.signal,
    });
    const url = (await response.text()).trim();
    return url.startsWith('http') ? url : '';
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function deliver(recipient, fields, files) {
  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));
  files.forEach((bytes) => {
    body.append('attachment', new Blob([bytes], { type: 'image/jpeg' }), 'image.jpg');
  });

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Origin: 'https://www.greatjunkremovalist.com.au',
      Referer: 'https://www.greatjunkremovalist.com.au/',
    },
    body,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }
  if (/needs Activation/i.test(text) || /needs Activation/i.test(String(payload?.message || ''))) {
    throw new Error(`Check ${recipient} for an Activate Form email and click the link, then send the quote again.`);
  }
  const accepted = payload?.success === true || payload?.success === 'true' || /submitted successfully/i.test(text);
  if (!response.ok || !accepted) {
    const detail = String(payload?.message || text).replace(/\s+/g, ' ').slice(0, 180);
    throw new Error(`The quote email to ${recipient} was not accepted (${response.status}: ${detail}). Please call 0451 198 226.`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await readJson(req);
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();
    const postcode = String(payload.postcode || '').trim();
    const service = String(payload.service || '').trim() || 'Not specified';
    const details = String(payload.details || '').trim() || 'No description provided';
    const photos = Array.isArray(payload.photos) ? payload.photos.filter((photo) => photo?.data).slice(0, 5) : [];

    if (!name || !phone || !postcode) {
      sendJson(res, 400, { ok: false, error: 'Please enter your name, phone, and address before sending.' });
      return;
    }

    const files = photos.map((photo) => Buffer.from(photo.data, 'base64'));
    const links = (await Promise.all(files.map((bytes) => hostPhoto(bytes)))).filter(Boolean);
    const junkPics = links.length
      ? links.join('\n')
      : files.length
        ? files.map(() => 'image.jpg').join('\n')
        : 'No photos';

    const fields = {
      Name: name,
      Email: email || 'Not provided',
      Phone_10_Digit_Number_: phone,
      Postcode: postcode,
      'What do you need removed?': service,
      'Junk Pics': junkPics,
      'Details of Your Junk': details,
      _replyto: email || 'info@greatjunkremovalist.com.au',
      _subject: `Quote request from ${name}`,
      _template: 'box',
      _captcha: 'false',
    };

    const results = await Promise.allSettled(RECIPIENTS.map((recipient) => deliver(recipient, fields, files)));
    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => (result.reason instanceof Error ? result.reason.message : 'Could not send the quote email.'));

    if (errors.length > 0) {
      sendJson(res, 502, { ok: false, error: errors.join(' ') });
      return;
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not send your quote request. Please call 0451 198 226.',
    });
  }
}
