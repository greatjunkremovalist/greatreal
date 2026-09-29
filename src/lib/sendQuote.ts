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
    const maxEdge = 800;
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
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.5));
    if (!blob) return new File([file], 'image.jpg', { type: 'image/jpeg' });
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return new File([file], 'image.jpg', { type: 'image/jpeg' });
  }
}

function encodePhotoLinks(links: string[]): string {
  const json = JSON.stringify(links);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildViewUrl(name: string, links: string[]): string {
  if (!links.length) return '';
  return `${SITE}/view-photos?n=${encodeURIComponent(name)}&d=${encodePhotoLinks(links)}`;
}

/** Simple FormSubmit text POST — this is what actually delivers the quote. */
async function sendInfoEmail(fields: Record<string, string>, images: File[] = []): Promise<boolean> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value));
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
 * Instant UI success. Email only to info@.
 * 1) Always send the quote text first (so mail never stops working)
 * 2) Then send photos as JPEG attachments + photo page link
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
    // Keep subject SHORT — long photo URLs in the subject were breaking FormSubmit delivery.
    const baseFields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Details: details,
      Photos: files.length ? `${files.length} photo(s) — sending next` : 'No photos',
      _replyto: email || INFO_EMAIL,
      _subject: `New quote — ${name} (${postcode})`,
      _template: 'basic',
      _captcha: 'false',
      _next: `${SITE}/?quote=sent`,
    };

    // 1) ALWAYS send the quote to info@ first (text only) so email delivery works.
    const quoteSent = await sendInfoEmail(baseFields, []);
    if (!quoteSent) {
      // One quick retry without extras.
      await sendInfoEmail(baseFields, []);
    }

    if (!files.length) return;

    // 2) Host photos, then send a second info@ email with images + openable photo page.
    try {
      const images = await Promise.all(files.map((file) => compressPhoto(file)));

      let links: string[] = [];
      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photos: await Promise.all(images.map(async (photo) => ({ data: await fileToBase64(photo) }))),
          }),
        });
        const result = (await response.json().catch(() => null)) as { ok?: boolean; links?: string[] } | null;
        if (result?.ok && Array.isArray(result.links)) {
          links = result.links.filter(Boolean);
        }
      } catch {
        links = [];
      }

      const viewUrl = buildViewUrl(name, links);
      const photoFields: Record<string, string> = {
        Name: name,
        Phone: phone,
        Postcode: postcode,
        _replyto: email || INFO_EMAIL,
        _subject: `Quote photos — ${name} (${postcode})`,
        _template: 'basic',
        _captcha: 'false',
        _next: `${SITE}/?quote=sent`,
      };

      if (viewUrl) {
        photoFields.Open_photos = viewUrl;
      }
      links.forEach((url, index) => {
        photoFields[`Photo_${index + 1}`] = url;
      });
      if (!links.length) {
        photoFields.Photos = 'Photo files attached below';
      }

      // Send with JPEG attachments (Gmail shows these as tappable files).
      let ok = await sendInfoEmail(photoFields, images);
      if (!ok) {
        // Fallback: links only, still to info@.
        ok = await sendInfoEmail(photoFields, []);
      }
    } catch {
      // Quote text already sent — photo follow-up is best effort.
    }
  })();
}
