import { json, checkPassword, issueToken, hasBlob } from './_lib.js';

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'ADMIN_PASSWORD тохируулагдаагүй байна' }, 503);
  }
  let body = {};
  try { body = await request.json(); } catch {}
  // small delay to slow down brute force attempts
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(body.password)) return json({ ok: false, error: 'Нууц үг буруу' }, 401);
  return json({ ok: true, token: issueToken(), storage: hasBlob() ? 'blob' : 'none' });
}
