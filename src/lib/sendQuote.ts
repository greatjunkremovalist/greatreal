import { QuoteFormData } from '../types';

export const QUOTE_INBOX = 'info@greatjunkremovalist.com.au';
const QUOTE_COPY = 'yogeshmehta8950@gmail.com';
const QUOTE_RECIPIENTS = [QUOTE_INBOX, QUOTE_COPY];

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
    return new File([blob], `image-${index + 1}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function hiddenField(name: string, value: string) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
}

function fileField(file: File) {
  const input = document.createElement('input');
  input.type = 'file';
  input.name = 'attachment';
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  return input;
}

/** Classic multipart post. FormSubmit's AJAX endpoint accepts text but drops images. */
function postQuoteForm(recipient: string, fields: Record<string, string>, photos: File[]): Promise<void> {
  const iframeName = `gjr-quote-${recipient.replace(/[^a-z0-9]/gi, '')}-${Date.now()}`;
  const iframe = document.createElement('iframe');
  iframe.name = iframeName;
  iframe.hidden = true;
  iframe.setAttribute('aria-hidden', 'true');

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `https://formsubmit.co/${encodeURIComponent(recipient)}`;
  form.enctype = 'multipart/form-data';
  form.target = iframeName;
  form.acceptCharset = 'UTF-8';
  form.hidden = true;

  Object.entries(fields).forEach(([name, value]) => form.appendChild(hiddenField(name, value)));
  photos.forEach((photo) => form.appendChild(fileField(photo)));

  document.body.appendChild(iframe);
  document.body.appendChild(form);

  return new Promise((resolve) => {
    let submitted = false;
    const cleanup = () => {
      form.remove();
      iframe.remove();
    };

    iframe.addEventListener('load', () => {
      if (!submitted) {
        submitted = true;
        form.submit();
        return;
      }
      cleanup();
      resolve();
    });

    window.setTimeout(() => {
      cleanup();
      resolve();
    }, 20000);
  });
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

  const photos = await Promise.all(photoFiles.slice(0, 5).map((file, index) => compressPhoto(file, index)));

  if (photoFiles.length > 0 && photos.length === 0) {
    throw new Error('Could not attach your photos. Please try smaller images or call 0451 198 226.');
  }

  const fields = {
    name: customerName,
    email: customerEmail || QUOTE_INBOX,
    Name: customerName,
    Email: customerEmail || 'Not provided',
    Phone: phone,
    Postcode: address,
    'What do you need removed?': service,
    'Details of Your Junk': details,
    'Sent from': source,
    _subject: `Quote request from ${customerName}`,
    _template: 'table',
    _captcha: 'false',
  };

  await Promise.all(QUOTE_RECIPIENTS.map((recipient) => postQuoteForm(recipient, fields, photos)));
}
