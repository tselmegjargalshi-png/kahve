import { put, del } from '@vercel/blob';
import { json, isAuthed, hasBlob } from './_lib.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function POST(request) {
  if (!isAuthed(request)) return json({ ok: false, error: 'Giriş gerekli' }, 401);
  if (!hasBlob()) return json({ ok: false, error: 'Vercel Blob bağlı değil' }, 503);
  const type = (request.headers.get('content-type') || '').split(';')[0];
  if (!TYPES[type]) return json({ ok: false, error: 'Yalnızca JPG, PNG, WEBP görseller' }, 415);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 4_000_000) return json({ ok: false, error: 'Görsel 4 MB altında olmalı' }, 413);
  const blob = await put(`images/item.${TYPES[type]}`, buf, {
    access: 'public',
    contentType: type,
    addRandomSuffix: true,
    cacheControlMaxAge: 31536000,
  });
  return json({ ok: true, url: blob.url });
}

export async function DELETE(request) {
  if (!isAuthed(request)) return json({ ok: false, error: 'Giriş gerekli' }, 401);
  if (!hasBlob()) return json({ ok: false }, 503);
  const url = new URL(request.url).searchParams.get('url');
  if (!url || !/\.blob\.vercel-storage\.com\/images\//.test(url)) return json({ ok: false, error: 'Geçersiz url' }, 400);
  await del(url);
  return json({ ok: true });
}
