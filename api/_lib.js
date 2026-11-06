import { timingSafeEqual, createHmac } from 'node:crypto';

export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

export const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Session token = HMAC(password, day). Valid for the current and previous day.
function tokenFor(day) {
  return createHmac('sha256', process.env.ADMIN_PASSWORD || '').update('galata:' + day).digest('hex');
}
export function issueToken() {
  return tokenFor(Math.floor(Date.now() / 864e5));
}
export function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return safeEqual(pw || '', real);
}
export function isAuthed(request) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const h = request.headers.get('authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!t) return false;
  const d = Math.floor(Date.now() / 864e5);
  return safeEqual(t, tokenFor(d)) || safeEqual(t, tokenFor(d - 1));
}
