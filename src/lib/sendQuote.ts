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
    const maxEdge = 800;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.5));
    if (!blob) return file;
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

async function hostPhotoLinks(photoFiles: File[]): Promise<string[]> {
  if (!photoFiles.length) return [];
  const photos = await Promise.all(photoFiles.slice(0, 5).map((file) => compressPhoto(file)));
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
  return result.links.filter(Boolean);
}

/**
 * One simple FormSubmit POST to info@ only.
 * A single clean message is far less likely to land in spam than repeated sends.
 */
function sendSimpleInfoEmail(fields: Record<string, string>): void {
  const iframeName = `gjr_quote_${Date.now()}`;
  const iframe = document.createElement('iframe');
  iframe.name = iframeName;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0);';
  document.body.appendChild(iframe);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `https://formsubmit.co/${INFO_EMAIL}`;
  form.target = iframeName;
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  window.setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 20000);
}

/**
 * Instant UI success. Background: host photos (if any), then one simple email to info@.
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
    let links: string[] = [];
    try {
      links = await hostPhotoLinks(files);
    } catch {
      links = [];
    }

    // Simple inbox-friendly fields — no duplicate keys, no multi-send, basic template.
    const fields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Photos: links.length ? links.join('\n') : 'No photos',
      Details: details,
      _replyto: email || INFO_EMAIL,
      _subject: `New quote — ${name} (${postcode})`,
      _template: 'basic',
      _captcha: 'false',
      _next: 'https://www.greatjunkremovalist.com.au/?quote=sent',
    };

    sendSimpleInfoEmail(fields);
  })();
}
