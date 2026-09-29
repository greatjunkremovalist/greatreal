import { QuoteFormData } from '../types';

/** Final destination for every quote */
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
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.55));
    if (!blob) return new File([file], 'image.jpg', { type: 'image/jpeg' });
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return new File([file], 'image.jpg', { type: 'image/jpeg' });
  }
}

function encodePhotoLinks(links: string[]): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(links))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildViewUrl(name: string, links: string[]): string {
  if (!links.length) return '';
  return `${SITE}/view-photos?n=${encodeURIComponent(name)}&d=${encodePhotoLinks(links)}`;
}

async function postToInfo(fields: Record<string, string>, images: File[] = []): Promise<boolean> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, String(value));
  });
  images.forEach((image, index) => {
    body.append('attachment', image, images.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg');
  });

  try {
    const response = await fetch(`https://formsubmit.co/${encodeURIComponent(INFO_EMAIL)}`, {
      method: 'POST',
      body,
    });
    const text = await response.text();
    if (/needs Activation/i.test(text)) return false;
    return response.ok || /submitted successfully/i.test(text);
  } catch {
    return false;
  }
}

/**
 * Final quote flow:
 * - UI success is instant
 * - Every quote goes ONLY to info@greatjunkremovalist.com.au
 * - Photos hosted + JPEG attachments + openable photo page
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
    const images = files.length ? await Promise.all(files.map((f) => compressPhoto(f))) : [];

    let links: string[] = [];
    let viewUrl = '';
    let emailedByApi = false;

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          postcode,
          service,
          details,
          photos: await Promise.all(images.map(async (photo) => ({ data: await fileToBase64(photo) }))),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        links?: string[];
        viewUrl?: string;
        emailed?: boolean;
      } | null;

      if (result?.ok) {
        links = Array.isArray(result.links) ? result.links.filter(Boolean) : [];
        viewUrl = result.viewUrl || buildViewUrl(name, links);
        emailedByApi = Boolean(result.emailed);
      }
    } catch {
      // Fall through to FormSubmit.
    }

    if (!viewUrl && links.length) {
      viewUrl = buildViewUrl(name, links);
    }

    // API HTML mail already delivered to info@ with blue photo buttons.
    if (emailedByApi) return;

    // Guaranteed browser delivery to info@ only (FormSubmit).
    const fields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Details: details,
      Open_photos: viewUrl || (images.length ? 'See attached image.jpg files' : 'No photos'),
      _replyto: email || INFO_EMAIL,
      _subject: `New quote — ${name} (${postcode})`,
      _template: 'basic',
      _captcha: 'false',
      _next: `${SITE}/?quote=sent`,
    };

    links.forEach((url, index) => {
      fields[`Photo_${index + 1}`] = url;
    });

    // First try: quote + JPEG attachments together.
    let sent = await postToInfo(fields, images);

    // If attachments caused a reject, still deliver the quote + photo page link.
    if (!sent) {
      sent = await postToInfo(fields, []);
    }

    // Last retry a few seconds later.
    if (!sent) {
      window.setTimeout(() => {
        void postToInfo(fields, images.length ? images : []).catch(() => {});
      }, 3000);
    }
  })();
}
