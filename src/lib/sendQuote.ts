import { QuoteFormData } from '../types';

export const QUOTE_INBOX = 'info@greatjunkremovalist.com.au';

async function compressPhoto(file: File, index: number): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1600;
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
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.72));
    if (!blob) return file;
    return new File([blob], `junk-photo-${index + 1}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export async function sendQuoteEmail(
  data: QuoteFormData,
  source: string,
  photoFiles: File[] = [],
): Promise<void> {
  const customerName = data.fullName.trim();
  const customerEmail = data.email.trim();
  const phone = data.phone.trim();
  const address = data.suburb.trim();
  const service = data.service.trim() || 'Not specified';
  const details = data.description.trim() || 'No description provided';

  if (!customerName || !phone || !address) {
    throw new Error('Please enter your name, phone, and address before sending.');
  }

  const photos = await Promise.all(photoFiles.slice(0, 4).map((file, index) => compressPhoto(file, index)));

  if (photoFiles.length > 0 && photos.length === 0) {
    throw new Error('Could not attach your photos. Please try smaller images or call 0451 198 226.');
  }

  const message = [
    `Name: ${customerName}`,
    `Phone: ${phone}`,
    `Email: ${customerEmail || 'Not provided'}`,
    `Address: ${address}`,
    `Service: ${service}`,
    `What to remove: ${details}`,
    `Photos: ${photos.length}`,
    `Sent from: ${source}`,
  ].join('\n');

  const body = new FormData();
  body.append('name', customerName);
  body.append('email', customerEmail || QUOTE_INBOX);
  body.append('Phone', phone);
  body.append('Address', address);
  body.append('Service', service);
  body.append('message', message);
  body.append('_subject', `Quote request from ${customerName}`);
  body.append('_template', 'table');
  body.append('_captcha', 'false');

  photos.forEach((photo) => {
    body.append('attachment', photo, photo.name);
  });

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(QUOTE_INBOX)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body,
  });

  const result = (await response.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
  const ok = response.ok && result?.success !== false && result?.success !== 'false';
  if (!ok) {
    throw new Error(result?.message || 'Could not send your quote request. Please call 0451 198 226.');
  }
}
