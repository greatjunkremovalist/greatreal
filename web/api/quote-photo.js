import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';

dotenv.config();

const SITE = 'https://www.greatjunkremovalist.com.au';
const MAX_IMAGE_CHARS = 1_800_000;
let tableReady = false;

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureTable(sql) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS quote_photos (
      id TEXT PRIMARY KEY,
      mime TEXT NOT NULL DEFAULT 'image/jpeg',
      data TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableReady = true;
}

function photoIdFromRequest(req) {
  const queryId = req?.query?.id;
  if (typeof queryId === 'string' && queryId) return queryId;
  try {
    const host = req.headers?.host || 'localhost';
    const url = new URL(req.url || '', `https://${host}`);
    return url.searchParams.get('id') || '';
  } catch {
    return '';
  }
}

export async function storeQuotePhoto(bytes) {
  const sql = database();
  if (!sql || !bytes?.length) return '';
  const data = Buffer.from(bytes).toString('base64');
  if (!data || data.length > MAX_IMAGE_CHARS) return '';
  const id = randomUUID().replace(/-/g, '');
  await ensureTable(sql);
  await sql`
    INSERT INTO quote_photos (id, mime, data)
    VALUES (${id}, 'image/jpeg', ${data})
  `;
  return `${SITE}/api/quote-photo?id=${id}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const id = String(photoIdFromRequest(req) || '').replace(/[^a-zA-Z0-9]/g, '');
  if (!id) {
    res.statusCode = 400;
    res.end('Missing photo');
    return;
  }

  const sql = database();
  if (!sql) {
    res.statusCode = 503;
    res.end('Photos are unavailable');
    return;
  }

  try {
    await ensureTable(sql);
    const rows = await sql`SELECT mime, data FROM quote_photos WHERE id = ${id} LIMIT 1`;
    const row = rows[0];
    if (!row?.data) {
      res.statusCode = 404;
      res.end('Photo not found');
      return;
    }
    const buffer = Buffer.from(row.data, 'base64');
    res.statusCode = 200;
    res.setHeader('Content-Type', row.mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.end(buffer);
  } catch {
    res.statusCode = 500;
    res.end('Could not load photo');
  }
}
