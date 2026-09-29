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
    const maxEdge = 850;
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
    // Keep files small so FormSubmit accepts image attachments.
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.55));
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

/**
 * Native multipart form POST — most reliable way to get image.jpg attachments
 * through FormSubmit and into the Gmail app.
 */
function postFormSubmitWithImages(fields: Record<string, string>, images: File[]): void {
  const iframeName = `gjr_fs_${Date.now()}`;
  const iframe = document.createElement('iframe');
  iframe.name = iframeName;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0);';
  document.body.appendChild(iframe);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `https://formsubmit.co/${INFO_EMAIL}`;
  form.enctype = 'multipart/form-data';
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

  // Only JPEG attachments — HTML/other types can make FormSubmit drop ALL files.
  images.forEach((image, index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'attachment';
    const file = new File(
      [image],
      images.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg',
      { type: 'image/jpeg' },
    );
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  window.setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 25000);
}

async function postFormSubmitFetch(fields: Record<string, string>, images: File[]): Promise<void> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value));
  images.forEach((image, index) => {
    body.append(
      'attachment',
      image,
      images.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg',
    );
  });

  await fetch(`https://formsubmit.co/${encodeURIComponent(INFO_EMAIL)}`, {
    method: 'POST',
    body,
  });
}

/**
 * Instant success. Mail only to info@.
 * - JPEG attachments via real form POST (show as tappable files in Gmail)
 * - Photo page URL in the subject (Gmail makes subject links tappable)
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
    const images = files.length ? await Promise.all(files.map((file) => compressPhoto(file))) : [];

    let links: string[] = [];
    if (images.length) {
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
          emailed?: boolean;
          viewUrl?: string;
        } | null;

        if (result?.emailed) {
          // HTML email already sent to info@ with blue tap links.
          return;
        }
        if (result?.ok && Array.isArray(result.links)) {
          links = result.links.filter(Boolean);
        }
      } catch {
        links = [];
      }
    } else {
      // No photos — still notify info@ via FormSubmit.
    }

    const viewUrl = buildViewUrl(name, links);

    // Subject URL is tappable in Gmail app even when FormSubmit body text is not.
    const subject = viewUrl
      ? `New quote — ${name} (${postcode}) — VIEW PHOTOS: ${viewUrl}`
      : `New quote — ${name} (${postcode})`;

    const fields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Details: details,
      _replyto: email || INFO_EMAIL,
      _subject: subject,
      _template: 'basic',
      _captcha: 'false',
      _next: `${SITE}/?quote=sent`,
    };

    if (viewUrl) {
      // Keep this field as the URL alone — easier to copy if needed.
      fields.View_photos = viewUrl;
    } else if (images.length) {
      fields.Photos = 'See attached image.jpg file(s) in this email';
    } else {
      fields.Photos = 'No photos';
    }

    // Primary: browser form with JPEG attachments (Gmail shows these as files you can tap).
    postFormSubmitWithImages(fields, images);

    // Backup fetch path (also JPEG only).
    window.setTimeout(() => {
      void postFormSubmitFetch(fields, images).catch(() => {});
    }, 1200);
  })();
}
