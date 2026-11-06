# Galata Kahve · Digital Menu

Mobile first digital menu for **Galata Kahve** (Beyoğlu, İstanbul) with a password protected admin panel.

* Public menu: `/` (Mongolian UI by default, TR / MN toggle; item names, prices (₺) and proper names in Turkish)
* Admin panel: `/admin`
* QR codes: `qr/`

## Stack

* Static HTML, CSS and vanilla JS (no build step)
* Vercel Functions in `api/` (Node, Web `Request`/`Response` handlers)
* Vercel Blob for menu data (`menu/*.json`, last 10 versions kept) and item images (`images/*`)

## Environment variables (Vercel project)

| Key | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Admin login password |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when a Blob store is connected to the project |

Without `BLOB_READ_WRITE_TOKEN` the site still works: the menu is read from `data/menu.json`, and the admin panel
saves only into the current browser (localStorage, preview at `/?preview`). Export the JSON from the admin menu and
commit it to `data/menu.json` to publish in that mode.

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/menu` | none | Latest saved menu (or `{source:"default"}`) |
| POST | `/api/menu` | Bearer | Save full menu JSON |
| POST | `/api/login` | none | `{password}` → `{token}` (valid about 24 to 48 h) |
| POST | `/api/upload` | Bearer | Raw image body (jpeg/png/webp, ≤ 4 MB) → `{url}` |
| DELETE | `/api/upload?url=` | Bearer | Delete an uploaded image |
| GET | `/api/status` | none | Storage / admin configuration state |

## Local development

```bash
npm install
npx vercel dev      # serves static files and /api functions
npm run qr          # regenerates the QR codes in qr/ (set MENU_URL to change the target)
```
