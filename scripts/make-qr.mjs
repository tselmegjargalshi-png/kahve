// Generates two branded QR codes (SVG + PNG) for the Galata Kahve menu.
// Usage: MENU_URL=https://kahve.vercel.app node scripts/make-qr.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const URL_ = process.env.MENU_URL || 'https://kahve-omega.vercel.app';
const root = new URL('..', import.meta.url).pathname;
const out = root + 'qr/';
mkdirSync(out, { recursive: true });
const logo = 'data:image/png;base64,' + readFileSync(root + 'assets/icon-512.png').toString('base64');

// Module matrix: from the `qrcode` package when installed, otherwise from QR_MATRIX (JSON 0/1 grid, level H).
let qr;
try {
  const QRCode = (await import('qrcode')).default;
  qr = QRCode.create(URL_, { errorCorrectionLevel: 'H' });
} catch {
  const grid = JSON.parse(readFileSync(process.env.QR_MATRIX, 'utf8'));
  qr = { modules: { size: grid.length, get: (r, c) => grid[r][c] } };
}
const N = qr.modules.size;
const dark = (x, y) => qr.modules.get(y, x) === 1 || qr.modules.get(y, x) === true;
const inFinder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
const finders = [[0, 0], [N - 7, 0], [0, N - 7]];

function modules(size, ox, oy, clearR, draw) {
  const s = size / N; const c = N / 2; let d = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (!dark(x, y) || inFinder(x, y)) continue;
    if (Math.hypot(x + 0.5 - c, y + 0.5 - c) < clearR) continue; // logo area (H level tolerates it)
    d += draw(ox + x * s, oy + y * s, s);
  }
  return d;
}

const FONTS = `<style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,600&amp;family=Manrope:wght@600;800&amp;display=swap');</style>`;
const skyline = (w, y, fill, op) => `<path transform="translate(0 ${y}) scale(${w / 800} 1)" fill="${fill}" opacity="${op}" d="M0 160V128h40v-14h22v14h30v-22h18v22h28V96l10-8 10 8v32h26v-18h30v18h24V70l6-42 6 42v58h20v-26h34v26h22V84h12l4-30h4l2-20 2 20h4l4 30h12v44h40v-40c0-26 30-44 56-44s56 18 56 44v40h18V40l3-24 3 24v88h14v-30h30v30h40V60l3-22 3 22v68h26v-16h40v16h32v-24h28v24h38V160z"/>`;

/* ---------- Design 1: "Gece" (night) ---------- */
function design1() {
  const W = 1000, H = 1300, Q = 600, ox = (W - Q) / 2, oy = 345, s = Q / N;
  const dots = modules(Q, ox, oy, 4.6, (x, y, s) => `<rect x="${(x + s * .02).toFixed(2)}" y="${(y + s * .02).toFixed(2)}" width="${(s * .96).toFixed(2)}" height="${(s * .96).toFixed(2)}" rx="${(s * .32).toFixed(2)}"/>`);
  const fp = finders.map(([fx, fy]) => {
    const x = ox + fx * s, y = oy + fy * s, w = 7 * s, c = w / 2;
    return `<rect x="${x + s / 2}" y="${y + s / 2}" width="${w - s}" height="${w - s}" rx="${s * .55}" fill="none" stroke="#2a1006" stroke-width="${s}"/>
      <rect x="${x + 2 * s}" y="${y + 2 * s}" width="${3 * s}" height="${3 * s}" rx="${s * .35}" fill="#2a1006"/>`;
  }).join('');
  const cx = W / 2, cy = oy + Q / 2, lr = s * 4.1;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${FONTS}
  <defs>
    <linearGradient id="amb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6c77d"/><stop offset=".55" stop-color="#e8a04a"/><stop offset="1" stop-color="#c97b35"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#3a1709"/><stop offset="1" stop-color="#160502"/></radialGradient>
    <pattern id="star" width="72" height="72" patternUnits="userSpaceOnUse"><g fill="none" stroke="#e8a04a" stroke-opacity=".08"><path d="M36 6l8.8 21.2L66 36l-21.2 8.8L36 66l-8.8-21.2L6 36l21.2-8.8z"/><rect x="21" y="21" width="30" height="30" transform="rotate(45 36 36)"/><rect x="21" y="21" width="30" height="30"/></g></pattern>
    <clipPath id="lc"><circle cx="${cx}" cy="${cy}" r="${lr - s * .5}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" rx="56" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" rx="56" fill="url(#star)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="40" fill="none" stroke="#e8a04a" stroke-opacity=".45" stroke-width="2"/>
  <text x="${cx}" y="118" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="800" font-size="22" letter-spacing="9" fill="#e8a04a">KAHVE DÜKKANI · BEYOĞLU</text>
  <text x="${cx}" y="222" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-weight="700" font-size="104" fill="#f5e8d0">Galata Kahve</text>
  <rect x="${ox - 80}" y="${oy - 80}" width="${Q + 160}" height="${Q + 160}" rx="56" fill="#f5e8d0" stroke="#e8a04a" stroke-width="5"/>
  <g fill="#2a1006">${dots}</g>
  ${fp}
  <circle cx="${cx}" cy="${cy}" r="${lr + 5}" fill="#f5e8d0"/><circle cx="${cx}" cy="${cy}" r="${lr}" fill="#e8a04a"/>
  <image href="${logo}" xlink:href="${logo}" x="${cx - lr}" y="${cy - lr}" width="${lr * 2}" height="${lr * 2}" clip-path="url(#lc)" preserveAspectRatio="xMidYMid slice"/>
  <text x="${cx}" y="${oy + Q + 168}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-weight="600" font-size="50" fill="#f5e8d0">Цэсээ уншуулаарай</text>
  <text x="${cx}" y="${oy + Q + 216}" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="600" font-size="24" letter-spacing="3" fill="#e8a04a">MENÜ İÇİN OKUTUN</text>
  ${skyline(W, H - 170, '#e8a04a', .12)}
</svg>`;
}

/* ---------- Design 2: "Kemer" (Ottoman arch, cream) ---------- */
function design2() {
  const W = 1000, H = 1300, Q = 600, ox = (W - Q) / 2, oy = 440, s = Q / N;
  const sq = modules(Q, ox, oy, 4.4, (x, y, s) => `<rect x="${(x + s * .02).toFixed(2)}" y="${(y + s * .02).toFixed(2)}" width="${(s * .96).toFixed(2)}" height="${(s * .96).toFixed(2)}" rx="${(s * .22).toFixed(2)}"/>`);
  const fp = finders.map(([fx, fy]) => {
    const x = ox + fx * s, y = oy + fy * s, w = 7 * s, c = w / 2;
    return `<rect x="${x + s / 2}" y="${y + s / 2}" width="${w - s}" height="${w - s}" rx="${s * .9}" fill="none" stroke="#2a1006" stroke-width="${s}"/>
      <rect x="${x + 2 * s}" y="${y + 2 * s}" width="${3 * s}" height="${3 * s}" rx="${s * .6}" fill="#2a1006"/>`;
  }).join('');
  const cx = W / 2, cy = oy + Q / 2, lr = s * 4;
  // pointed Ottoman arch frame
  const ax = 110, aw = W - 220, top = 70, spring = 430, bottom = H - 90;
  const arch = `M${ax} ${bottom} V${spring} C ${ax} ${spring - 190}, ${cx - 120} ${top + 70}, ${cx} ${top} C ${cx + 120} ${top + 70}, ${ax + aw} ${spring - 190}, ${ax + aw} ${spring} V${bottom} Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${FONTS}
  <defs>
    <linearGradient id="esp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0805"/><stop offset="1" stop-color="#5a2a12"/></linearGradient>
    <linearGradient id="cr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf1df"/><stop offset="1" stop-color="#f1dfc1"/></linearGradient>
    <pattern id="tile" width="60" height="60" patternUnits="userSpaceOnUse"><g fill="none" stroke="#e8a04a" stroke-opacity=".22" stroke-width="1.2"><path d="M30 4l7 19 19 7-19 7-7 19-7-19-19-7 19-7z"/><circle cx="30" cy="30" r="5"/></g></pattern>
    <clipPath id="lc2"><circle cx="${cx}" cy="${cy}" r="${lr - s * .45}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" rx="56" fill="#1a0805"/>
  <rect width="${W}" height="${H}" rx="56" fill="url(#tile)"/>
  <path d="${arch}" fill="url(#cr)" stroke="#e8a04a" stroke-width="6"/>
  <path d="${arch}" fill="none" stroke="#c97b35" stroke-width="2" transform="translate(${cx} ${H / 2}) scale(.955 .965) translate(${-cx} ${-H / 2})"/>
  <g transform="translate(${cx} ${top + 120})" fill="#c97b35">
    <path d="M-16 -22a24 24 0 1 0 0 44a19 19 0 1 1 0-44z"/>
    <path d="M14 0l3.6 8.4 9 .8-6.8 6 2 8.8-7.8-4.6-7.8 4.6 2-8.8-6.8-6 9-.8z" transform="translate(4 -12) scale(.8)"/>
  </g>
  <text x="${cx}" y="${top + 250}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-weight="700" font-size="84" fill="#2a1006">Galata Kahve</text>
  <text x="${cx}" y="${top + 300}" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="800" font-size="20" letter-spacing="8" fill="#c97b35">BİR FİNCAN, KIRK YIL HATIR</text>
  <g fill="url(#esp)">${sq}</g>
  ${fp}
  <circle cx="${cx}" cy="${cy}" r="${lr}" fill="#fbf1df" stroke="#e8a04a" stroke-width="${s * .5}"/>
  <image href="${logo}" xlink:href="${logo}" x="${cx - lr}" y="${cy - lr}" width="${lr * 2}" height="${lr * 2}" clip-path="url(#lc2)" preserveAspectRatio="xMidYMid slice"/>
  <text x="${cx}" y="${oy + Q + 92}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-weight="600" font-size="46" fill="#2a1006">Уншуулаад, амтаа сонго</text>
  <text x="${cx}" y="${oy + Q + 138}" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-weight="600" font-size="22" letter-spacing="3" fill="#8a5428">@galatakahve.ist</text>
</svg>`;
}

const files = { 'galata-kahve-qr-gece': design1(), 'galata-kahve-qr-kemer': design2() };
for (const [n, svg] of Object.entries(files)) writeFileSync(out + n + '.svg', svg);

// Render PNGs with Playwright (verify decoding separately, e.g. with jsQR or OpenCV).
const { chromium } = require('playwright');
const browser = await chromium.launch();
for (const [n, svg] of Object.entries(files)) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1300 }, deviceScaleFactor: 2 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  writeFileSync(out + n + '.png', await page.locator('svg').screenshot({ omitBackground: true }));
  console.log('wrote', n);
  await page.close();
}
await browser.close();
