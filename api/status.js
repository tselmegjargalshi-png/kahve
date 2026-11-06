import { json, hasBlob } from './_lib.js';
export function GET() {
  return json({ storage: hasBlob() ? 'blob' : 'none', admin: Boolean(process.env.ADMIN_PASSWORD) });
}
