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

/** Keep links that stay online for at least 24 hours. Drop tmpfiles (expires in about 1 hour). */
function preferClickablePhotoUrls(links: string[]): string[] {
  const scored = links.filter((url) => /^https?:\/\//i.test(url) && !/tmpfiles\.org/i.test(url));
  const lasting = scored.filter((url) => /greatjunkremovalist\.com\.au\/api\/quote-photo/i.test(url) || /catbox\.moe/i.test(url));
  return lasting.length ? lasting : scored;
}

async function hostOnLitterboxClient(file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('reqtype', 'fileupload');
    body.append('time', '72h');
    body.append('fileToUpload', file, 'image.jpg');
    const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body,
    });
    const url = (await response.text()).trim();
    return url.startsWith('http') ? url : '';
  } catch {
    return '';
  }
}

async function hostOnCatboxClient(file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('reqtype', 'fileupload');
    body.append('fileToUpload', file, 'image.jpg');
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body,
    });
    const url = (await response.text()).trim();
    return url.startsWith('http') ? url : '';
  } catch {
    return '';
  }
}

async function hostPhotosInBrowser(images: File[]): Promise<string[]> {
  const links: string[] = [];
  for (const image of images) {
    const url = (await hostOnLitterboxClient(image)) || (await hostOnCatboxClient(image));
    if (url) links.push(url);
  }
  return preferClickablePhotoUrls(links);
}

async function postToInfo(fields: Record<string, string>): Promise<boolean> {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, String(value));
  });

  try {
    const response = await fetch(`https://formsubmit.co/${encodeURIComponent(INFO_EMAIL)}`, {
      method: 'POST',
      body,
    });
    const text = await response.text();
    if (/needs Activation/i.test(text)) return false;
    if (response.status === 429 || /rate limit/i.test(text)) return false;
    if (response.status >= 500) return false;
    return response.ok || /submitted successfully|thank you/i.test(text);
  } catch {
    return false;
  }
}

/**
 * Quote → info@ only.
 * Wait until the website mailer confirms delivery before the form says it was sent.
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
  const images = files.length ? await Promise.all(files.map((f) => compressPhoto(f))) : [];

  let links: string[] = [];
  let emailed = false;

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
    } | null;

    if (result?.ok) {
      links = preferClickablePhotoUrls(Array.isArray(result.links) ? result.links.filter(Boolean) : []);
      emailed = Boolean(result.emailed);
    }
  } catch {
    emailed = false;
  }

  if (emailed) return;

  if (!links.length && images.length) {
    links = await hostPhotosInBrowser(images);
  }

  const junkPics = links.length ? links.join('\n') : 'No photos';
  const sent = await postToInfo({
    Name: name,
    Email: email || 'Not provided',
    Phone_10_Digit_Number_: phone,
    Postcode: postcode,
    'What_do_you_need_removed?': service,
    Details: details,
    Junk_Pics: junkPics,
    _replyto: email || INFO_EMAIL,
    _subject: `New quote — ${name} (${postcode})`,
    _template: 'basic',
    _captcha: 'false',
    _next: `${SITE}/?quote=sent`,
  });

  if (!sent) {
    throw new Error('The quote could not be emailed. Please call 0451 198 226.');
  }
}
