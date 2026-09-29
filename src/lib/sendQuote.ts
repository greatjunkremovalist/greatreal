import { QuoteFormData } from '../types';

/** Business inbox — every quote must be accepted here before success. */
const INFO_EMAIL = 'info@greatjunkremovalist.com.au';
const BACKUP_EMAIL = 'yogeshmehta8950@gmail.com';

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
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.55));
    if (!blob) return file;
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function formatJunkPics(links: string[]): string {
  if (!links.length) return 'No photos';
  return links.join('\n');
}

async function postQuoteForm(recipient: string, fields: Record<string, string>): Promise<void> {
  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));

  const response = await fetch(`https://formsubmit.co/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    body,
  });
  const text = await response.text();

  if (/needs Activation/i.test(text)) {
    throw new Error(
      `Open ${recipient} (including spam) and click the FormSubmit “Activate Form” link, then send the quote again.`,
    );
  }
  if (!response.ok || !/submitted successfully/i.test(text)) {
    throw new Error(`The quote email to ${recipient} was not accepted. Please call 0451 198 226.`);
  }
}

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

  const photos = await Promise.all(photoFiles.slice(0, 5).map((file) => compressPhoto(file)));
  let links: string[] = [];

  if (photos.length > 0) {
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photos: await Promise.all(photos.map(async (photo) => ({ data: await fileToBase64(photo) }))),
      }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; links?: string[] } | null;
    if (!response.ok || !result?.ok) {
      throw new Error(result?.error || 'Could not prepare your photo links. Please call 0451 198 226.');
    }
    links = Array.isArray(result.links) ? result.links.filter(Boolean) : [];
    if (links.length === 0) {
      throw new Error('Could not prepare your photo links. Please try smaller images or call 0451 198 226.');
    }
  }

  const baseFields = {
    Name: name,
    Email: email || 'Not provided',
    Phone_10_Digit_Number_: phone,
    Postcode: postcode,
    'What do you need removed?': service,
    'Junk Pics': formatJunkPics(links),
    'Details of Your Junk': details,
    _replyto: email || INFO_EMAIL,
    _subject: `Quote request from ${name}`,
    _template: 'box',
    _captcha: 'false',
  };

  // Start Gmail copy in parallel (also CCs info@ as a second delivery path).
  const gmailCopy = postQuoteForm(BACKUP_EMAIL, { ...baseFields, _cc: INFO_EMAIL });

  // info@ must be accepted — do not show success if only Gmail worked.
  try {
    await postQuoteForm(INFO_EMAIL, { ...baseFields, _cc: BACKUP_EMAIL });
  } catch (infoError) {
    // Fallback: Gmail FormSubmit is often already activated; its CC still reaches info@.
    try {
      await gmailCopy;
    } catch {
      throw infoError instanceof Error
        ? infoError
        : new Error(`Could not send the quote to ${INFO_EMAIL}. Please call 0451 198 226.`);
    }
    return;
  }

  void gmailCopy.catch(() => {});
}
