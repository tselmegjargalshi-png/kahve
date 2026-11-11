import { put, list, del } from '@vercel/blob';
import { json, isAuthed, hasBlob } from './_lib.js';

const PREFIX = 'menu/';

async function latest() {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  return blobs;
}

export async function GET() {
  if (!hasBlob()) return json({ source: 'default' });
  try {
    const blobs = await latest();
    if (!blobs.length) return json({ source: 'default' });
    const r = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!r.ok) return json({ source: 'default' });
    const menu = await r.json();
    return json({ source: 'blob', menu }, 200, { 'cache-control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=30' });
  } catch (e) {
    return json({ source: 'default', error: String(e.message || e) });
  }
}

function validate(m) {
  if (!m || typeof m !== 'object') return 'Geçersiz veri';
  if (!m.brand || !Array.isArray(m.categories)) return 'brand ve categories gerekli';
  for (const c of m.categories) {
    if (!c.id || !c.name || !Array.isArray(c.items)) return 'Geçersiz kategori: ' + (c.name || '?');
    for (const i of c.items) {
      if (!i.id || !i.name) return 'Ürün adı eksik';
      if (typeof i.price !== 'number' || i.price < 0) return 'Geçersiz fiyat: ' + i.name;
    }
  }
  return null;
}

export async function POST(request) {
  if (!isAuthed(request)) return json({ ok: false, error: 'Giriş gerekli' }, 401);
  if (!hasBlob()) return json({ ok: false, error: 'Vercel Blob bağlı değil' }, 503);
  let menu;
  try { menu = await request.json(); } catch { return json({ ok: false, error: 'Geçersiz JSON' }, 400); }
  const err = validate(menu);
  if (err) return json({ ok: false, error: err }, 400);
  menu.updatedAt = new Date().toISOString();
  const body = JSON.stringify(menu);
  if (body.length > 2_000_000) return json({ ok: false, error: 'Veri çok büyük' }, 413);
  const saved = await put(`${PREFIX}${Date.now()}.json`, body, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
  });
  // keep the 10 most recent versions as history
  try {
    const blobs = await latest();
    const old = blobs.slice(10).map((b) => b.url);
    if (old.length) await del(old);
  } catch {}
  return json({ ok: true, url: saved.url, updatedAt: menu.updatedAt });
}
