import { QuoteFormData } from '../types';

const INFO_EMAIL = 'info@greatjunkremovalist.com.au';

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
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
    if (!blob) return new File([file], 'image.jpg', { type: 'image/jpeg' });
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return new File([file], 'image.jpg', { type: file.type || 'image/jpeg' });
  }
}

/**
 * Send only to info@.
 * Photos are real file attachments named image.jpg — FormSubmit shows these as clickable downloads.
 * (Plain URL text in FormSubmit emails is NOT clickable.)
 */
async function sendQuoteToInfo(fields: Record<string, string>, photos: File[]): Promise<void> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.append(key, value));

  photos.forEach((photo, index) => {
    const filename = photos.length > 1 ? `image-${index + 1}.jpg` : 'image.jpg';
    body.append('attachment', photo, filename);
  });

  const response = await fetch(`https://formsubmit.co/${encodeURIComponent(INFO_EMAIL)}`, {
    method: 'POST',
    body,
    keepalive: true,
  });

  const text = await response.text();
  if (/needs Activation/i.test(text)) {
    throw new Error(
      `Open ${INFO_EMAIL} (and spam), click FormSubmit “Activate Form”, then send again.`,
    );
  }
  if (!response.ok && !/submitted successfully/i.test(text)) {
    // Still try iframe fallback without files if fetch is blocked.
    throw new Error('FormSubmit did not accept the quote.');
  }
}

/**
 * Instant UI success. Email only to info@.
 * Photos arrive as clickable image.jpg attachments in the email.
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
    if (files.length > 0) {
      try {
        photos = await Promise.all(files.map((file) => compressPhoto(file)));
      } catch {
        photos = files.map((file) => new File([file], 'image.jpg', { type: 'image/jpeg' }));
      }
    }

    const fields: Record<string, string> = {
      Name: name,
      Email: email || 'Not provided',
      Phone: phone,
      Postcode: postcode,
      Service: service,
      Details: details,
      Photos: photos.length
        ? `${photos.length} photo(s) attached — tap the image.jpg file(s) above/below to open`
        : 'No photos',
      _replyto: email || INFO_EMAIL,
      _subject: `New quote — ${name} (${postcode})`,
      _template: 'basic',
      _captcha: 'false',
      _next: 'https://www.greatjunkremovalist.com.au/?quote=sent',
    };

    try {
      await sendQuoteToInfo(fields, photos);
    } catch {
      // One retry shortly after — still only to info@.
      window.setTimeout(() => {
        void sendQuoteToInfo(fields, photos).catch(() => {});
      }, 2000);
    }
  })();
}
