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

const HOST_HEADERS = { 'User-Agent': 'Mozilla/5.0' };

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
  const hosts = [hostOnCatbox, hostOnLitterbox, hostOnTmpfiles, hostOnZeroX];
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
      sendJson(res, 502, { ok: false, error: 'Could not prepare your photo links. Please try smaller images or call 0451 198 226.' });
      return;
    }

    sendJson(res, 200, { ok: true, links });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not prepare your photos. Please call 0451 198 226.',
    });
  }
}
