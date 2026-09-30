import { QuoteFormData } from '../types';

/** Final destination for every quote */
const INFO_EMAIL = 'info@greatjunkremovalist.com.au';
/** Temporary copy — remove when no longer needed */
const TEMP_CC_EMAIL = 'yogeshmehta8950@gmail.com';

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

/** Direct image.jpg URLs that Gmail turns blue (same as your working screenshot). */
function preferClickablePhotoUrls(links: string[]): string[] {
  const scored = links.filter((url) => /^https?:\/\//i.test(url));
  const tmpfiles = scored.filter((url) => /tmpfiles\.org\/dl\//i.test(url) && /image\.jpg/i.test(url));
  if (tmpfiles.length) return tmpfiles;
  const directJpg = scored.filter((url) => /\/image\.jpg(\?|$)/i.test(url));
  if (directJpg.length) return directJpg;
  return scored;
}

/** Browser-side tmpfiles upload — same host as the working Junk_Pics links. */
async function hostOnTmpfilesClient(file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('file', file, 'image.jpg');
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body,
    });
    const data = (await response.json().catch(() => null)) as { data?: { url?: string } } | null;
    const page = String(data?.data?.url || '');
    if (!page.startsWith('http')) return '';
    return page.replace('://tmpfiles.org/', '://tmpfiles.org/dl/');
  } catch {
    return '';
  }
}

async function hostOnLitterboxClient(file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('reqtype', 'fileupload');
    body.append('time', '24h');
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

async function hostPhotosInBrowser(images: File[]): Promise<string[]> {
  const links: string[] = [];
  for (const image of images) {
    const url = (await hostOnTmpfilesClient(image)) || (await hostOnLitterboxClient(image));
    if (url) links.push(url);
  }
  return preferClickablePhotoUrls(links);
}

/** Classic form post. Submit immediately — waiting for iframe load was skipping the send. */
function postQuoteForm(recipient: string, fields: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    const frameName = `gjr-quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:absolute;width:1px;height:1px;border:0;left:-9999px;';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${recipient}`;
    form.target = frameName;
    form.acceptCharset = 'UTF-8';

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    const finish = () => {
      form.remove();
      iframe.remove();
      resolve();
    };

    document.body.append(iframe, form);
    form.submit();
    window.setTimeout(finish, 8000);
  });
}

async function deliverQuote(fields: Record<string, string>): Promise<void> {
  // Separate sends. A CC on the info@ mail was stopping delivery entirely.
  await postQuoteForm(INFO_EMAIL, fields);
  await postQuoteForm(TEMP_CC_EMAIL, fields);
}

/**
 * Quote → info@ only.
 * Always FormSubmit with Junk_Pics = https://tmpfiles.org/dl/.../image.jpg
 * (proven blue/clickable in Gmail).
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

    // 1) Server hosts photos (prefers tmpfiles).
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
        if (result.emailed) return;
      }
    } catch {
      // Browser fallback below.
    }

    // 2) If API gave no links, host from the browser (same tmpfiles URLs).
    if (!links.length && images.length) {
      links = await hostPhotosInBrowser(images);
    }

    const junkPics = links.length ? links.join('\n') : 'No photos';

    // 3) Always deliver via FormSubmit — Junk_Pics with raw image.jpg links (clickable in Gmail).
    const fields: Record<string, string> = {
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
    };

    await deliverQuote(fields);
  })();
}
