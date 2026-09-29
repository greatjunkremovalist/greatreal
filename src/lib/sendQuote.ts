import { QuoteFormData } from '../types';

const INFO_EMAIL = 'info@greatjunkremovalist.com.au';
const SITE = 'https://www.greatjunkremovalist.com.au';

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
    const maxEdge = 900;
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
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.6));
    if (!blob) return new File([file], 'image.jpg', { type: 'image/jpeg' });
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return new File([file], 'image.jpg', { type: 'image/jpeg' });
  }
}

/** URL-safe payload for /view-photos — opens as a normal page in the Gmail app. */
export function encodePhotoLinks(links: string[]): string {
  const json = JSON.stringify(links);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildViewUrl(name: string, links: string[]): string {
  if (!links.length) return '';
  const d = encodePhotoLinks(links);
  const n = encodeURIComponent(name);
  return `${SITE}/view-photos?n=${n}&d=${d}`;
}

function buildPhotosHtmlFile(name: string, links: string[], viewUrl: string): File {
  const list = links
    .map(
      (url, index) =>
        `<p><a href="${url}" style="color:#1a73e8;font-size:18px;font-weight:700;">Tap to open photo ${index + 1}</a><br/>
         <a href="${url}"><img src="${url}" alt="Photo ${index + 1}" style="max-width:100%;margin-top:8px;"/></a></p>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Photos — ${name}</title></head>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h1>Quote photos — ${name}</h1>
  ${viewUrl ? `<p><a href="${viewUrl}" style="color:#1a73e8;font-size:18px;font-weight:700;">Open photo page</a></p>` : ''}
  ${list}
</body></html>`;

  return new File([html], 'CLICK-TO-VIEW-PHOTOS.html', { type: 'text/html' });
}

/** FormSubmit fallback — Gmail app: tap URL in the subject, or open attachments. */
async function sendFormSubmitFallback(
  fields: Record<string, string>,
  attachments: File[],
): Promise<void> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value));
  attachments.forEach((file) => body.append('attachment', file, file.name));

  await fetch(`https://formsubmit.co/${encodeURIComponent(INFO_EMAIL)}`, {
    method: 'POST',
    body,
    keepalive: true,
  });
}

/**
 * Instant UI success. Email only to info@ (works in Gmail app).
 * Prefers HTML email with blue tap links; falls back to FormSubmit + photo page URL.
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
    const photos = files.length ? await Promise.all(files.map((file) => compressPhoto(file))) : [];

    const apiResponse = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        postcode,
        service,
        details,
        photos: await Promise.all(photos.map(async (photo) => ({ data: await fileToBase64(photo) }))),
        viewUrl: '', // filled after links return — first call hosts photos
      }),
      keepalive: true,
    }).catch(() => null);

    let links: string[] = [];
    let emailed = false;

    if (apiResponse) {
      const result = (await apiResponse.json().catch(() => null)) as {
        ok?: boolean;
        links?: string[];
        emailed?: boolean;
      } | null;
      if (result?.ok && Array.isArray(result.links)) links = result.links.filter(Boolean);
      emailed = Boolean(result?.emailed);
    }

    const viewUrl = buildViewUrl(name, links);

    // If API hosted photos but could not send HTML mail, send a second API attempt is skipped —
    // FormSubmit fallback below includes the Gmail-friendly view URL.
    if (emailed) return;

    const attachments: File[] = [];
    if (links.length) {
      attachments.push(buildPhotosHtmlFile(name, links, viewUrl));
      photos.forEach((photo, index) => {
        attachments.push(
          new File([photo], photos.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg', {
            type: 'image/jpeg',
          }),
        );
      });
    }

    // Put the website photo link in the subject — Gmail app often makes subject URLs tappable.
    const subject = viewUrl
      ? `New quote — ${name} (${postcode}) — Photos: ${viewUrl}`
      : `New quote — ${name} (${postcode})`;

    const fields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Details: details,
      Open_photos_in_browser: viewUrl || 'No photos',
      Photos: viewUrl
        ? `Open this page to view photos: ${viewUrl}`
        : photos.length
          ? 'See attached image files'
          : 'No photos',
      _replyto: email || INFO_EMAIL,
      _subject: subject,
      _template: 'basic',
      _captcha: 'false',
      _next: `${SITE}/?quote=sent`,
    };

    try {
      await sendFormSubmitFallback(fields, attachments);
    } catch {
      window.setTimeout(() => {
        void sendFormSubmitFallback(fields, attachments).catch(() => {});
      }, 2000);
    }
  })();
}
