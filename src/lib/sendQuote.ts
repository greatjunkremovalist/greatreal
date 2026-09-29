import { QuoteFormData } from '../types';

const INFO_EMAIL = 'info@greatjunkremovalist.com.au';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read a photo.'));
    reader.readAsDataURL(file);
  });
}

async function compressPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1000;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return new File([file], 'image.jpg', { type: 'image/jpeg' });
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.68));
    if (!blob) return new File([file], 'image.jpg', { type: 'image/jpeg' });
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return new File([file], 'image.jpg', { type: 'image/jpeg' });
  }
}

async function hostPhotoLinks(photos: File[]): Promise<string[]> {
  if (!photos.length) return [];
  const response = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photos: await Promise.all(photos.map(async (photo) => ({ data: await fileToBase64(photo) }))),
    }),
    keepalive: true,
  });
  const result = (await response.json().catch(() => null)) as { ok?: boolean; links?: string[] } | null;
  if (!response.ok || !result?.ok || !Array.isArray(result.links)) return [];
  return result.links.filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url));
}

/** HTML file the customer can open — contains real blue clickable photo links. */
function buildPhotosHtmlFile(name: string, links: string[]): File {
  const anchors = links
    .map(
      (url, index) => `
      <p style="margin:16px 0;">
        <a href="${url}" style="color:#1a73e8;font-size:18px;font-weight:700;">
          Click to view photo ${index + 1}
        </a>
        <br/>
        <a href="${url}">
          <img src="${url}" alt="Photo ${index + 1}" style="max-width:100%;margin-top:8px;border-radius:8px;" />
        </a>
      </p>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Quote photos — ${name}</title>
</head>
<body style="font-family:Arial,sans-serif;padding:20px;background:#fff;color:#111;">
  <h1 style="font-size:22px;">Quote photos — ${name}</h1>
  <p>Tap a blue link or image below to open the photo.</p>
  ${anchors || '<p>No photos.</p>'}
</body>
</html>`;

  return new File([html], 'CLICK-TO-VIEW-PHOTOS.html', { type: 'text/html' });
}

/**
 * FormSubmit shows attachments as clickable files.
 * Plain URL text in FormSubmit emails is never clickable — so we attach:
 * 1) CLICK-TO-VIEW-PHOTOS.html (blue links inside)
 * 2) image.jpg files
 */
async function sendToInfoOnly(fields: Record<string, string>, attachments: File[]): Promise<void> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value));
  attachments.forEach((file) => {
    body.append('attachment', file, file.name);
  });

  const response = await fetch(`https://formsubmit.co/${encodeURIComponent(INFO_EMAIL)}`, {
    method: 'POST',
    body,
    keepalive: true,
  });
  const text = await response.text();

  if (/needs Activation/i.test(text)) {
    throw new Error(
      `Open ${INFO_EMAIL} (and spam), click FormSubmit “Activate Form”, then send the quote again.`,
    );
  }
}

/**
 * Instant UI success. Mail only to info@.
 * Photos are clickable via attached HTML + image.jpg files.
 */
export async function sendQuoteEmail(
  data: QuoteFormData,
  _source: string,
  photoFiles: File[] = [],
): Promise<void> {
  const name = data.fullName.trim();
  const email = data.email.trim();
  const phone = data.phone.trim();
  const postcode = data.suburb.trim();
  const service = data.service.trim() || 'Not specified';
  const details = data.description.trim() || 'No description provided';

  if (!name || !phone || !postcode) {
    throw new Error('Please enter your name, phone, and address before sending.');
  }

  const files = photoFiles.slice(0, 5);

  void (async () => {
    let photos: File[] = [];
    if (files.length) {
      photos = await Promise.all(files.map((file) => compressPhoto(file)));
    }

    let links: string[] = [];
    if (photos.length) {
      try {
        links = await hostPhotoLinks(photos);
      } catch {
        links = [];
      }
    }

    const attachments: File[] = [];
    if (links.length) {
      attachments.push(buildPhotosHtmlFile(name, links));
    }
    photos.forEach((photo, index) => {
      attachments.push(
        new File([photo], photos.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg', {
          type: 'image/jpeg',
        }),
      );
    });

    const fields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Details: details,
      Photos: attachments.length
        ? 'Open attachment CLICK-TO-VIEW-PHOTOS.html (blue links) or image.jpg to see photos'
        : 'No photos',
      _replyto: email || INFO_EMAIL,
      _subject: `New quote — ${name} (${postcode})`,
      _template: 'basic',
      _captcha: 'false',
      _next: 'https://www.greatjunkremovalist.com.au/?quote=sent',
    };

    try {
      await sendToInfoOnly(fields, attachments);
    } catch {
      window.setTimeout(() => {
        void sendToInfoOnly(fields, attachments).catch(() => {});
      }, 2500);
    }
  })();
}
