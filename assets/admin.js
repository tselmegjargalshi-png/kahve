(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + Math.random().toString(36).slice(2, 8);
  const slug = (s) => String(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || uid('c');

  const S = { token: null, storage: 'none', menu: null, view: 'brand', open: new Set(), dirty: false };
  try { S.token = sessionStorage.getItem('gk_token'); } catch {}

  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (el.hidden = true), 2600);
  }
  function setDirty(v = true) {
    S.dirty = v;
    const el = $('#saveState');
    el.textContent = v ? 'Хадгалаагүй өөрчлөлт' : 'Хадгалсан';
    el.classList.toggle('dirty', v);
    if (v && S.storage !== 'blob') { try { localStorage.setItem('gk_menu_local', JSON.stringify(S.menu)); } catch {} }
  }
  window.addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

  const api = (path, opts = {}) => fetch(path, { ...opts, headers: { ...(opts.headers || {}), ...(S.token ? { authorization: 'Bearer ' + S.token } : {}) } });

  /* ---------- login ---------- */
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#loginBtn'); btn.disabled = true; $('#loginErr').hidden = true;
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || 'Нэвтэрч чадсангүй (' + r.status + ')');
      S.token = d.token; S.storage = d.storage;
      try { sessionStorage.setItem('gk_token', d.token); } catch {}
      await boot();
    } catch (err) {
      $('#loginErr').textContent = err.message; $('#loginErr').hidden = false;
    } finally { btn.disabled = false; }
  });

  async function boot() {
    try { const st = await (await fetch('/api/status', { cache: 'no-store' })).json(); S.storage = st.storage; } catch {}
    S.menu = await loadMenu();
    $('#login').hidden = true; $('#app').hidden = false;
    const b = $('#storageBanner');
    if (S.storage === 'blob') {
      b.hidden = true;
    } else {
      b.hidden = false;
      b.innerHTML = '<b>Анхаар:</b> Сервер талын хадгалалт (Vercel Blob) холбогдоогүй байна. Өөрчлөлт зөвхөн энэ хөтөч дээр хадгалагдана. Шалгахдаа <a href="/?preview" target="_blank" style="text-decoration:underline">/?preview</a> хаягаар нээнэ үү. Бүх хэрэглэгчид харагдуулахын тулд JSON татаж аваад <code>data/menu.json</code> файлыг шинэчилнэ үү.';
    }
    renderSide(); renderPane();
  }

  async function loadMenu() {
    if (S.storage !== 'blob') {
      try { const m = JSON.parse(localStorage.getItem('gk_menu_local') || 'null'); if (m) return m; } catch {}
    }
    try {
      const r = await fetch('/api/menu', { cache: 'no-store' });
      if (r.ok) { const d = await r.json(); if (d.source === 'blob' && d.menu) return d.menu; }
    } catch {}
    return (await fetch('/data/menu.json', { cache: 'no-store' })).json();
  }

  /* ---------- save ---------- */
  async function save() {
    const btn = $('#saveBtn'); btn.disabled = true;
    try {
      if (S.storage !== 'blob') {
        localStorage.setItem('gk_menu_local', JSON.stringify(S.menu));
        setDirty(false); toast('Энэ хөтөч дээр хадгаллаа');
        return;
      }
      const r = await api('/api/menu', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(S.menu) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { logout(); throw new Error('Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.'); }
      if (!r.ok || !d.ok) throw new Error(d.error || 'Хадгалж чадсангүй');
      S.menu.updatedAt = d.updatedAt;
      setDirty(false); toast('Хадгаллаа ✓ Цэс шинэчлэгдлээ');
    } catch (err) { toast(err.message); } finally { btn.disabled = false; }
  }
  $('#saveBtn').addEventListener('click', save);
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });

  function logout() { S.token = null; try { sessionStorage.removeItem('gk_token'); } catch {} $('#app').hidden = true; $('#login').hidden = false; }

  /* ---------- more menu ---------- */
  $('#moreBtn').addEventListener('click', (e) => { e.stopPropagation(); $('#morePop').hidden = !$('#morePop').hidden; });
  document.addEventListener('click', (e) => { if (!e.target.closest('#morePop')) $('#morePop').hidden = true; });
  $('#logoutBtn').addEventListener('click', logout);
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(S.menu, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'menu.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#importFile').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const m = JSON.parse(await f.text());
      if (!m.brand || !Array.isArray(m.categories)) throw new Error();
      S.menu = m; setDirty(); S.view = 'brand'; renderSide(); renderPane(); toast('JSON орууллаа. Хадгалахаа мартуузай.');
    } catch { toast('JSON файл буруу байна'); }
    e.target.value = '';
  });
  $('#resetBtn').addEventListener('click', async () => {
    if (!confirm('Анхны цэс рүү сэргээх үү? Хадгалах товч дарах хүртэл нийтэд нөлөөлөхгүй.')) return;
    S.menu = await (await fetch('/data/menu.json', { cache: 'no-store' })).json();
    setDirty(); S.view = 'brand'; renderSide(); renderPane();
  });

  /* ---------- side ---------- */
  function renderSide() {
    $('#catList').innerHTML = S.menu.categories.map((c, i) =>
      `<button type="button" class="side-item ${S.view === i ? 'on' : ''} ${c.hidden ? 'off' : ''}" data-view="${i}"><span>${String(i + 1).padStart(2, '0')}</span> ${esc(c.name)}<span class="cnt">${c.items.length}</span></button>`).join('');
    $$('.side [data-view="brand"]').forEach((b) => b.classList.toggle('on', S.view === 'brand'));
  }
  document.querySelector('.side').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]'); if (!b) return;
    S.view = b.dataset.view === 'brand' ? 'brand' : Number(b.dataset.view);
    S.open.clear(); renderSide(); renderPane(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('#addCat').addEventListener('click', () => {
    const name = prompt('Ангиллын нэр (Турк хэлээр), жишээ нь: Kurabiyeler');
    if (!name) return;
    S.menu.categories.push({ id: slug(name) + '_' + Math.random().toString(36).slice(2, 5), name, subtitle: { mn: '', tr: '' }, items: [] });
    S.view = S.menu.categories.length - 1; setDirty(); renderSide(); renderPane();
  });

  /* ---------- panes ---------- */
  const fld = (label, path, value, type = 'text', extra = '') =>
    `<label class="fld"><span>${label}</span>${type === 'textarea'
      ? `<textarea data-p="${path}" ${extra}>${esc(value)}</textarea>`
      : `<input type="${type}" data-p="${path}" value="${esc(value)}" ${extra} />`}</label>`;

  function renderPane() {
    const p = $('#pane');
    if (S.view === 'brand') {
      const b = S.menu.brand;
      p.innerHTML = `
      <div class="panel"><h2>Ерөнхий мэдээлэл</h2><p class="muted">Цэсний толгой, уриа үг, холбоо барих мэдээлэл.</p>
        <h3>Уриа үг</h3>
        <div class="grid2">${fld('Уриа (MN)', 'brand.tagline.mn', b.tagline?.mn)}${fld('Уриа (TR)', 'brand.tagline.tr', b.tagline?.tr)}</div>
        <div class="grid2">${fld('Зүйр үг (TR)', 'brand.proverb.tr', b.proverb?.tr)}${fld('Зүйр үгийн орчуулга (MN)', 'brand.proverb.mn', b.proverb?.mn)}</div>
        <div class="grid2">${fld('Түүх (MN)', 'brand.story.mn', b.story?.mn, 'textarea')}${fld('Түүх (TR)', 'brand.story.tr', b.story?.tr, 'textarea')}</div>
        <div class="grid2">${fld('Мэдэгдэл (MN)', 'brand.notice.mn', b.notice?.mn)}${fld('Мэдэгдэл (TR)', 'brand.notice.tr', b.notice?.tr)}</div>
        <p class="hint">Мэдэгдлийг хоосон орхивол цэсэнд харагдахгүй.</p>
      </div>
      <div class="panel"><h3>Холбоо барих</h3>
        ${fld('Хаяг', 'brand.address', b.address)}
        ${fld('Google Maps холбоос', 'brand.mapsUrl', b.mapsUrl, 'url')}
        <div class="grid2">${fld('Instagram (@ гүйгээр)', 'brand.instagram', b.instagram)}${fld('Утас', 'brand.phone', b.phone, 'tel')}</div>
        <div class="grid3 keep">${fld('Нээх цаг', 'brand.open', b.open, 'time')}${fld('Хаах цаг', 'brand.close', b.close, 'time')}${fld('Wi Fi нэр', 'brand.wifi', b.wifi)}</div>
        ${fld('Төлбөрийн хэрэгсэл (таслалаар тусгаарла)', 'brand.payments', (b.payments || []).join(', '))}
      </div>`;
      return;
    }
    const c = S.menu.categories[S.view];
    if (!c) { S.view = 'brand'; return renderPane(); }
    p.innerHTML = `
      <div class="panel">
        <div class="pane-head"><div><h2>${esc(c.name)}</h2><p class="muted">${c.items.length} бүтээгдэхүүн</p></div>
          <div class="row-actions">
            <button type="button" class="mini" data-act="catUp">↑</button>
            <button type="button" class="mini" data-act="catDown">↓</button>
            <button type="button" class="mini danger" data-act="catDel">Ангилал устгах</button>
          </div></div>
        ${fld('Ангиллын нэр (Турк)', `cat.name`, c.name)}
        <div class="grid2">${fld('Дэд гарчиг (MN)', 'cat.subtitle.mn', c.subtitle?.mn)}${fld('Дэд гарчиг (TR)', 'cat.subtitle.tr', c.subtitle?.tr)}</div>
        <div class="checks"><label><input type="checkbox" data-p="cat.hidden" ${c.hidden ? 'checked' : ''}/> Цэснээс нуух</label></div>
      </div>
      <div class="panel">
        <div class="pane-head"><h3>Бүтээгдэхүүн</h3><button type="button" class="mini amber" data-act="addItem">＋ Бүтээгдэхүүн нэмэх</button></div>
        <div id="items">${c.items.map((it, i) => itemHTML(it, i)).join('') || '<p class="muted">Одоогоор бүтээгдэхүүн алга.</p>'}</div>
      </div>`;
  }

  function itemHTML(it, i) {
    const open = S.open.has(it.id);
    const als = new Set(it.allergens || []);
    return `<div class="it ${open ? 'open' : ''} ${it.available === false || it.hidden ? 'off' : ''}" data-i="${i}">
      <div class="it-head" data-act="toggle">
        ${it.image ? `<img class="th" src="${esc(it.image)}" alt="" />` : '<span class="th">☕</span>'}
        <span class="nm">${esc(it.name)}</span>
        <span class="pr">${Number(it.price)} ₺</span>
        <span class="chev">›</span>
      </div>
      <div class="it-body">
        ${fld('Нэр (Турк)', 'item.name', it.name)}
        <div class="grid2">${fld('Тайлбар (MN)', 'item.desc.mn', it.desc?.mn, 'textarea')}${fld('Тайлбар (TR)', 'item.desc.tr', it.desc?.tr, 'textarea')}</div>
        <div class="grid3 keep">
          ${fld('Үнэ (₺)', 'item.price', it.price, 'number', 'min="0" step="1" inputmode="decimal"')}
          ${fld('Илчлэг (ккал)', 'item.kcal', it.kcal, 'number', 'min="0" step="1" inputmode="numeric"')}
          <label class="fld"><span>Тэмдэг</span><select data-p="item.badge">
            <option value="" ${!it.badge ? 'selected' : ''}>Байхгүй</option>
            <option value="signature" ${it.badge === 'signature' ? 'selected' : ''}>Онцлох</option>
            <option value="new" ${it.badge === 'new' ? 'selected' : ''}>Шинэ</option>
          </select></label>
        </div>
        <span class="fld"><span>Харшил үүсгэгч</span></span>
        <div class="al-pick">${GK_ALLERGENS.map((a) => `<label><input type="checkbox" data-al="${a.key}" ${als.has(a.key) ? 'checked' : ''}/>${gkAllergenIcon(a.key)}<span>${esc(a.mn)}</span></label>`).join('')}</div>
        <span class="fld"><span>Зураг (заавал биш)</span></span>
        <div class="imgbox dz" data-drop>
          ${it.image ? `<img src="${esc(it.image)}" alt="" />` : '<div class="ph">Зураг байхгүй<br>Энд чирж оруулж болно</div>'}
          <div class="imgact">
            <label class="mini amber upl">${it.image ? 'Зураг солих' : 'Зураг оруулах'}<input type="file" accept="image/jpeg,image/png,image/webp" data-upload /></label>
            ${it.image ? '<button type="button" class="mini danger" data-act="rmImg">Зураг устгах</button>' : ''}
            <input class="fldurl" type="url" placeholder="эсвэл зургийн URL хаяг" data-p="item.image" value="${esc(it.image || '')}" style="background:var(--bg);border:1px solid var(--line2);color:var(--cream);border-radius:10px;padding:8px 10px;font:inherit;font-size:13px" />
            <span class="hint" style="margin:0">JPG, PNG, WEBP. Автоматаар 1200px болгож шахна.</span>
          </div>
        </div>
        <div class="checks">
          <label><input type="checkbox" data-p="item.soldout" ${it.available === false ? 'checked' : ''}/> Дууссан</label>
          <label><input type="checkbox" data-p="item.hidden" ${it.hidden ? 'checked' : ''}/> Цэснээс нуух</label>
        </div>
        <div class="row-actions">
          <button type="button" class="mini" data-act="up">↑ Дээш</button>
          <button type="button" class="mini" data-act="down">↓ Доош</button>
          <button type="button" class="mini" data-act="dup">Хуулбарлах</button>
          <select class="mini" data-act="move"><option value="">Өөр ангилал руу зөөх…</option>${S.menu.categories.map((c, ci) => ci === S.view ? '' : `<option value="${ci}">${esc(c.name)}</option>`).join('')}</select>
          <button type="button" class="mini danger" data-act="del">Устгах</button>
        </div>
      </div>
    </div>`;
  }

  const cat = () => S.menu.categories[S.view];
  const itemOf = (el) => { const w = el.closest('.it'); return w ? { w, i: Number(w.dataset.i), it: cat().items[Number(w.dataset.i)] } : null; };
  function rerenderItem(w, i) { const tmp = document.createElement('div'); tmp.innerHTML = itemHTML(cat().items[i], i); w.replaceWith(tmp.firstElementChild); }

  /* ---------- field edits ---------- */
  $('#pane').addEventListener('input', onField);
  $('#pane').addEventListener('change', onField);
  function onField(e) {
    const el = e.target;
    if (el.dataset.al) {
      const x = itemOf(el); const set = new Set(x.it.allergens || []);
      el.checked ? set.add(el.dataset.al) : set.delete(el.dataset.al);
      x.it.allergens = GK_ALLERGENS.map((a) => a.key).filter((k) => set.has(k));
      return setDirty();
    }
    if (el.dataset.upload !== undefined && e.type === 'change') { const x = itemOf(el); return upload(el.files[0], x); }
    if (el.dataset.act === 'move' && e.type === 'change') { if (el.value === '') return; const x = itemOf(el); const [m] = cat().items.splice(x.i, 1); S.menu.categories[Number(el.value)].items.push(m); setDirty(); renderSide(); renderPane(); return toast('Зөөлөө'); }
    const p = el.dataset.p; if (!p) return;
    const val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (el.value === '' ? 0 : Number(el.value)) : el.value;
    if (p.startsWith('brand.')) {
      const keys = p.split('.').slice(1);
      let o = S.menu.brand; for (const k of keys.slice(0, -1)) o = o[k] ??= {};
      o[keys.at(-1)] = keys[0] === 'payments' ? String(val).split(',').map((s) => s.trim()).filter(Boolean) : val;
    } else if (p.startsWith('cat.')) {
      const keys = p.split('.').slice(1); const c = cat();
      if (keys[0] === 'subtitle') { c.subtitle ??= {}; c.subtitle[keys[1]] = val; } else c[keys[0]] = val;
      if (keys[0] === 'name' || keys[0] === 'hidden') { renderSide(); if (keys[0] === 'name') $('.panel h2').textContent = val; }
    } else if (p.startsWith('item.')) {
      const x = itemOf(el); const keys = p.split('.').slice(1);
      if (keys[0] === 'desc') { x.it.desc ??= {}; x.it.desc[keys[1]] = val; }
      else if (keys[0] === 'soldout') x.it.available = !val;
      else x.it[keys[0]] = val;
      if (keys[0] === 'name') x.w.querySelector('.nm').textContent = val;
      if (keys[0] === 'price') x.w.querySelector('.pr').textContent = val + ' ₺';
      if (keys[0] === 'image' && e.type === 'change') rerenderItem(x.w, x.i);
      if ((keys[0] === 'soldout' || keys[0] === 'hidden')) x.w.classList.toggle('off', x.it.available === false || x.it.hidden);
    }
    setDirty();
  }

  /* ---------- actions ---------- */
  $('#pane').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT') return;
    const act = b.dataset.act; const c = cat();
    if (act === 'toggle') { const x = itemOf(b); S.open.has(x.it.id) ? S.open.delete(x.it.id) : S.open.add(x.it.id); x.w.classList.toggle('open'); return; }
    if (act === 'addItem') {
      const it = { id: uid('i'), name: 'Yeni Ürün', desc: { mn: '', tr: '' }, price: 0, kcal: 0, allergens: [], badge: '', available: true, image: '' };
      c.items.unshift(it); S.open.add(it.id); setDirty(); renderSide(); renderPane();
      setTimeout(() => $('#items .it [data-p="item.name"]')?.select(), 50); return;
    }
    if (act === 'catUp' || act === 'catDown') {
      const i = S.view, j = act === 'catUp' ? i - 1 : i + 1; const arr = S.menu.categories;
      if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; S.view = j; setDirty(); renderSide(); return;
    }
    if (act === 'catDel') {
      if (!confirm(`"${c.name}" ангилал болон доторх ${c.items.length} бүтээгдэхүүнийг устгах уу?`)) return;
      S.menu.categories.splice(S.view, 1); S.view = 'brand'; setDirty(); renderSide(); renderPane(); return;
    }
    const x = itemOf(b); if (!x) return;
    if (act === 'up' || act === 'down') {
      const j = act === 'up' ? x.i - 1 : x.i + 1; if (j < 0 || j >= c.items.length) return;
      [c.items[x.i], c.items[j]] = [c.items[j], c.items[x.i]]; setDirty(); renderPane(); return;
    }
    if (act === 'dup') { const copy = { ...structuredClone(x.it), id: uid('i'), name: x.it.name + ' 2' }; c.items.splice(x.i + 1, 0, copy); S.open.add(copy.id); setDirty(); renderSide(); renderPane(); return; }
    if (act === 'del') { if (!confirm(`"${x.it.name}" устгах уу?`)) return; c.items.splice(x.i, 1); setDirty(); renderSide(); renderPane(); return; }
    if (act === 'rmImg') {
      const old = x.it.image; x.it.image = ''; setDirty(); rerenderItem(x.w, x.i);
      if (S.storage === 'blob' && /blob\.vercel-storage\.com\/images\//.test(old)) api('/api/upload?url=' + encodeURIComponent(old), { method: 'DELETE' }).catch(() => {});
    }
  });

  /* drag and drop images */
  $('#pane').addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('drag'); } });
  $('#pane').addEventListener('dragleave', (e) => { e.target.closest('[data-drop]')?.classList.remove('drag'); });
  $('#pane').addEventListener('drop', (e) => {
    const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('drag');
    const f = e.dataTransfer.files[0]; if (f) upload(f, itemOf(z));
  });

  /* ---------- image upload ---------- */
  async function compress(file, max = 1200, q = 0.84) {
    const img = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    const type = 'image/webp';
    const blob = await new Promise((r) => cv.toBlob(r, type, q));
    return blob && blob.type === type ? blob : new Promise((r) => cv.toBlob(r, 'image/jpeg', q));
  }
  async function upload(file, x) {
    if (!file || !x) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast('Зөвхөн JPG, PNG, WEBP зураг');
    toast('Зураг боловсруулж байна…');
    try {
      const blob = await compress(file);
      if (S.storage === 'blob') {
        const r = await api('/api/upload', { method: 'POST', headers: { 'content-type': blob.type }, body: blob });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.ok) throw new Error(d.error || 'Байршуулж чадсангүй');
        x.it.image = d.url;
      } else {
        // Fallback: embed as a small data URL (stored only in this browser)
        const small = await compress(file, 600, 0.75);
        x.it.image = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(small); });
      }
      setDirty(); rerenderItem(x.w, x.i);
      toast(S.storage === 'blob' ? 'Зураг орлоо. Хадгалах товчийг дарна уу.' : 'Зураг энэ хөтөч дээр хадгалагдлаа');
    } catch (err) { toast(err.message); }
  }

  /* ---------- auto login ---------- */
  if (S.token) {
    fetch('/api/status').then(() => boot()).catch(() => logout());
  }
})();
