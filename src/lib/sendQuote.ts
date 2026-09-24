import { QuoteFormData } from '../types';

export const QUOTE_INBOX = 'info@greatjunkremovalist.com.au';

function dataUrlToFile(dataUrl: string, filename: string): File | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const type = match[1] || 'image/jpeg';
  const extension = type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  return new File([bytes], `${filename}.${extension}`, { type });
}

async function photoForEmail(dataUrl: string, index: number): Promise<File | null> {
  const original = dataUrlToFile(dataUrl, `junk-photo-${index + 1}`);
  if (!original) return null;

  try {
    const bitmap = await createImageBitmap(original);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return original;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.72));
    if (!blob) return original;
    return new File([blob], `junk-photo-${index + 1}.jpg`, { type: 'image/jpeg' });
  } catch {
    return original.size < 9_000_000 ? original : null;
  }
}

export async function sendQuoteEmail(data: QuoteFormData, source: string): Promise<void> {
  const customerName = data.fullName.trim();
  const customerEmail = data.email.trim();
  const phone = data.phone.trim();
  const address = data.suburb.trim();
  const service = data.service.trim() || 'Not specified';
  const details = data.description.trim() || 'No description provided';

  const photos = (
    await Promise.all(data.photos.slice(0, 4).map((photo, index) => photoForEmail(photo, index)))
  ).filter((file): file is File => Boolean(file));

  if (data.photos.length > 0 && photos.length === 0) {
    throw new Error('Could not attach your photos. Please try smaller images or call 0451 198 226.');
  }

  const body = new FormData();
  body.append('name', customerName);
  body.append('email', customerEmail || QUOTE_INBOX);
  body.append('Customer name', customerName);
  body.append('Customer email', customerEmail || 'Not provided');
  body.append('Phone', phone);
  body.append('Address', address);
  body.append('Service', service);
  body.append('What to remove', details);
  body.append('Photos attached', String(photos.length));
  body.append('Form', source);
  body.append('_subject', `Quote request — ${customerName} (${address})`);
  body.append('_template', 'table');
  body.append('_captcha', 'false');
  if (customerEmail) body.append('_replyto', customerEmail);

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
