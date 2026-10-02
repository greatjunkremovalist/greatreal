import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const MAX_IMAGE_CHARS = 1_800_000;

function sendJson(res, status, data) {
  if (typeof res.status === 'function') {
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).json(data);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function cleanText(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanImage(value) {
  const raw = String(value || '');
  if (!raw.startsWith('data:image/jpeg') || raw.length > MAX_IMAGE_CHARS) return '';
  return raw;
}

function toJob(row) {
  return {
    id: row.id,
    title: row.title,
    serviceCategory: row.service_category,
    suburb: row.suburb,
    date: row.job_date,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    description: row.description || '',
    verified: true,
    illustrative: false,
  };
}

export default async function handler(req, res) {
  const sql = database();
  if (!sql) {
    sendJson(res, 503, { ok: false, error: 'Job photos cannot be saved right now.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, title, service_category, suburb, job_date, before_image, after_image, description
        FROM daily_jobs
        ORDER BY created_at DESC
        LIMIT 24
      `;
      sendJson(res, 200, { ok: true, jobs: rows.map(toJob) });
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'Method not allowed' });
      return;
    }

    const body = await readJson(req);
    const beforeImage = cleanImage(body.beforeImage);
    const afterImage = cleanImage(body.afterImage);
    if (!beforeImage || !afterImage) {
      sendJson(res, 400, { ok: false, error: 'Add both a before photo and an after photo as JPG images.' });
      return;
    }

    const job = {
      id: `job-${Date.now()}`,
      title: cleanText(body.title, 80) || 'Completed job',
      serviceCategory: cleanText(body.serviceCategory, 40) || 'Junk Removal',
      suburb: cleanText(body.suburb, 80) || 'Melbourne VIC',
      date: cleanText(body.date, 20) || new Date().toISOString().slice(0, 10),
      description: cleanText(body.description, 280) || 'Same-day junk removal in Melbourne.',
      beforeImage,
      afterImage,
    };

    await sql`
      INSERT INTO daily_jobs (
        id, title, service_category, suburb, job_date, before_image, after_image, description
      ) VALUES (
        ${job.id},
        ${job.title},
        ${job.serviceCategory},
        ${job.suburb},
        ${job.date},
        ${job.beforeImage},
        ${job.afterImage},
        ${job.description}
      )
    `;

    sendJson(res, 200, { ok: true, job: { ...job, verified: true, illustrative: false } });
  } catch {
    sendJson(res, 500, { ok: false, error: 'The photos could not be saved. Please try again.' });
  }
}
