import { QuoteFormData } from '../types';

export const QUOTE_INBOX = 'info@greatjunkremovalist.com.au';
const QUOTE_COPY = 'yogeshmehta8950@gmail.com';
const QUOTE_RECIPIENTS = [QUOTE_INBOX, QUOTE_COPY];

async function compressPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1400;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return new File([file], 'image.jpg', { type: file.type || 'image/jpeg' });
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
    if (!blob) return new File([file], 'image.jpg', { type: file.type || 'image/jpeg' });
    return new File([blob], 'image.jpg', { type: 'image/jpeg' });
  } catch {
    return new File([file], 'image.jpg', { type: file.type || 'image/jpeg' });
  }
}

async function postQuoteForm(recipient: string, fields: Record<string, string>, photos: File[]): Promise<void> {
  const body = new FormData();
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));
  photos.forEach((photo) => body.append('attachment', photo, 'image.jpg'));

  const response = await fetch(`https://formsubmit.co/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    body,
  });
  const text = await response.text();

  if (/needs Activation/i.test(text)) {
    throw new Error(
      `Check ${recipient} for an email called Activate Form, click the link, then send the quote again.`,
    );
  }
  if (!response.ok || !/submitted successfully/i.test(text)) {
    throw new Error(`The quote email to ${recipient} was not accepted. Please call 0451 198 226.`);
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

  const photos = await Promise.all(photoFiles.slice(0, 5).map((file) => compressPhoto(file)));

  if (photoFiles.length > 0 && photos.length === 0) {
    throw new Error('Could not attach your photos. Please try smaller images or call 0451 198 226.');
  }

  const fields = {
    name: customerName,
    email: customerEmail || QUOTE_INBOX,
    Name: customerName,
    Email: customerEmail || 'Not provided',
    Phone_10_Digit_Number_: phone,
    Postcode: address,
    'What do you need removed?': service,
    'Details of Your Junk': details,
    'Sent from': source,
    _subject: `Quote request from ${customerName}`,
    _template: 'table',
    _captcha: 'false',
  };

  const results = await Promise.allSettled(
    QUOTE_RECIPIENTS.map((recipient) => postQuoteForm(recipient, fields, photos)),
  );
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failures.length > 0) {
    throw new Error(failures.map((failure) => String(failure.reason instanceof Error ? failure.reason.message : failure.reason)).join(' '));
  }
}
