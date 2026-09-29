import { QuoteFormData } from '../types';

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

function formatJunkPics(links: string[]): string {
  if (!links.length) return 'No photos';
  return links.join('\n');
}

function buildFormData(fields: Record<string, string>): FormData {
  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));
  return body;
}

function isAcceptedResponse(text: string, data: unknown): boolean {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (String(record.success).toLowerCase() === 'true') return true;
    if (typeof record.message === 'string' && /success/i.test(record.message)) return true;
    if (typeof record.error === 'string' && record.error.trim()) return false;
  }
  return /submitted successfully|email has been sent|success/i.test(text);
}

async function postToFormSubmit(recipient: string, fields: Record<string, string>, mode: 'ajax' | 'html'): Promise<void> {
  const url =
    mode === 'ajax'
      ? `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`
      : `https://formsubmit.co/${encodeURIComponent(recipient)}`;

  const response = await fetch(url, {
    method: 'POST',
    body: buildFormData(fields),
    headers: mode === 'ajax' ? { Accept: 'application/json' } : undefined,
    keepalive: true,
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (/needs Activation/i.test(text) || /needs Activation/i.test(JSON.stringify(data || {}))) {
    throw new Error(`activation:${recipient}`);
  }
  if (!response.ok || !isAcceptedResponse(text, data)) {
    throw new Error(`rejected:${recipient}`);
  }
}

/** Fire every reliable path so info@ gets the quote. Retries on failure. */
async function deliverToInfoInbox(fields: Record<string, string>): Promise<void> {
  const infoFields = { ...fields, _cc: BACKUP_EMAIL };
  const gmailFields = { ...fields, _cc: INFO_EMAIL };

  const paths: Array<() => Promise<void>> = [
    () => postToFormSubmit(INFO_EMAIL, infoFields, 'ajax'),
    () => postToFormSubmit(INFO_EMAIL, infoFields, 'html'),
    () => postToFormSubmit(BACKUP_EMAIL, gmailFields, 'ajax'),
    () => postToFormSubmit(BACKUP_EMAIL, gmailFields, 'html'),
  ];

  // Run all paths in parallel — whichever FormSubmit endpoint works still reaches info@ (direct or CC).
  const results = await Promise.allSettled(paths.map((run) => run()));
  if (results.some((result) => result.status === 'fulfilled')) {
    // Extra delayed retries in case FormSubmit was briefly down.
    window.setTimeout(() => {
      void postToFormSubmit(INFO_EMAIL, infoFields, 'ajax').catch(() => {});
      void postToFormSubmit(BACKUP_EMAIL, gmailFields, 'ajax').catch(() => {});
    }, 2500);
    return;
  }

  // One more sequential retry round.
  for (const run of paths) {
    try {
      await run();
      return;
    } catch {
      // try next
    }
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
 * Validates instantly, shows success immediately in the UI, and delivers the
 * quote to info@ in the background (with Gmail CC backup + retries).
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

  // Background delivery — does not block the success screen.
  void (async () => {
    let links: string[] = [];
    try {
      links = await hostPhotoLinks(files);
    } catch {
      links = [];
    }

    const fields = {
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

    try {
      await deliverToInfoInbox(fields);
    } catch {
      // Last-resort delayed attempt so a brief FormSubmit outage does not drop the lead.
      window.setTimeout(() => {
        void deliverToInfoInbox(fields);
      }, 4000);
    }
  })();
}
