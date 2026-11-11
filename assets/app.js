(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const UI = {
    tr: {
      since: 'İstanbul · Galata · 1924\'ten beri',
      search: 'Ürün ara…',
      open: 'Şu an açık', closed: 'Şu an kapalı', closesAt: 'kapanış', opensAt: 'açılış',
      kcal: 'kcal', signature: 'İmza', new: 'Yeni', sold: 'Tükendi',
      allergenTitle: 'Alerjen bilgisi', allergenSub: 'Alerjiniz varsa sipariş öncesi baristamıza söyleyin.',
      location: 'Konum', openMap: 'Haritada aç', phone: 'Telefon', hours: 'Çalışma saatleri',
      hoursText: (o, c) => `Her gün ${o} ile ${c} arası`,
      payments: 'Geçerli ödeme yöntemleri',
      filterTitle: 'Filtre', filterSub: 'Hariç tutmak istediğiniz alerjenleri seçin.',
      onlySignature: 'Sadece imza ürünler', clear: 'Temizle', apply: 'Uygula',
      empty: 'Aramanıza uygun ürün bulunamadı.',
      contains: 'İçerdiği alerjenler', noAllergen: 'Bilinen alerjen içermez',
      price: 'Fiyat', energy: 'Enerji',
      falTitle: 'Kahve Falı', falIntro: 'Türk kahvesinden sonra fincan kapatılır, fal okunur. Bir deneyin.',
      falBtn: 'Fincanı kapat', falAgain: 'Bir daha kapat',
      footNote: 'Tüm fiyatlar Türk lirası (₺) olup KDV dahildir. Kalori değerleri yaklaşıktır.',
      results: (n) => `${n} ürün bulundu`,
    },
  };

  const FORTUNES = {
    tr: [
      'Fincanın dibinde bir kuş var. Yakında güzel bir haber alacaksınız.',
      'Bir yol görünüyor. Yakında beklenmedik bir yolculuk var.',
      'Kalp şekli çok net. Sizi seven biri sizi düşünüyor.',
      'Bir balık görünüyor. Bereketli bir gün sizi bekliyor.',
      'Galata Kulesi kadar yüksek bir hedefiniz yakında gerçekleşecek.',
      'Önünüzde iki yol var. Kalbinizin sesini dinleyin.',
      'Hilal şekli var. Yeni başlangıçlar için tam zamanı.',
      'Fincanda bir yıldız parlıyor. Dileğiniz kabul olacak.',
      'Bir anahtar görünüyor. Uzun zamandır kapalı bir kapı açılacak.',
      'Bir ağaç büyüyor. Sabrınızın meyvesini toplayacaksınız.',
    ],
  };

  const state = {
    lang: 'tr', menu: null, q: '', exclude: new Set(), sigOnly: false,
  };

  const t = (k, ...a) => { const v = UI[state.lang][k]; return typeof v === 'function' ? v(...a) : v; };
  const L = (o) => (o && typeof o === 'object' ? (o.tr ?? '') : (o ?? ''));
  const fmtPrice = (p) => `${Number(p).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}<small>₺</small>`;
  const norm = (s) => String(s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');

  /* ---------- data ---------- */
  async function loadMenu() {
    const params = new URLSearchParams(location.search);
    if (params.has('preview')) {
      try { const m = JSON.parse(localStorage.getItem('gk_menu_local') || 'null'); if (m) return m; } catch {}
    }
    try {
      const r = await fetch('/api/menu', { cache: 'no-store' });
      if (r.ok) { const d = await r.json(); if (d.source === 'blob' && d.menu) return d.menu; }
    } catch {}
    const r = await fetch('/data/menu.json', { cache: 'no-cache' });
    return r.json();
  }

  /* ---------- rendering ---------- */
  function applyStatic() {
    document.documentElement.lang = 'tr';
    $$('[data-i]').forEach((el) => { el.textContent = t(el.dataset.i); });
    const b = state.menu.brand;
    $$('[data-b]').forEach((el) => {
      const path = el.dataset.b.split('.');
      let v = b; for (const p of path) v = v?.[p];
      el.textContent = typeof v === 'object' ? L(v) : (v || '');
    });
    $('#q').placeholder = t('search');
    $('#addr').textContent = b.address;
    $('#locCard').href = b.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
    $('#ig').textContent = '@' + b.instagram;
    $('#igCard').href = 'https://instagram.com/' + b.instagram;
    $('#tel').textContent = b.phone;
    $('#telCard').href = 'tel:' + b.phone.replace(/\s/g, '');
    $('#hours').textContent = t('hoursText', b.open, b.close);
    $('#wifi').textContent = b.wifi || '';
    $('#wifi').closest('.card').hidden = !b.wifi;
    $('#pays').innerHTML = (b.payments || []).map((p) => `<span>${esc(p)}</span>`).join('');
    $('#yr').textContent = new Date().getFullYear();
    $('#legendGrid').innerHTML = GK_ALLERGENS.map((a) => `<div>${gkAllergenIcon(a.key)}<span>${esc(a[state.lang])}</span></div>`).join('');
    $('#fgrid').innerHTML = GK_ALLERGENS.map((a) => `<button type="button" class="fchip ${state.exclude.has(a.key) ? 'on' : ''}" data-al="${a.key}" aria-pressed="${state.exclude.has(a.key)}">${gkAllergenIcon(a.key)}<span>${esc(a[state.lang])}</span></button>`).join('');
    updateStatus();
  }

  function visibleItems(cat) {
    const q = norm(state.q);
    return cat.items.filter((i) => {
      if (i.hidden) return false;
      if (state.sigOnly && i.badge !== 'signature') return false;
      if (i.allergens?.some((a) => state.exclude.has(a))) return false;
      if (q) {
        const hay = norm([i.name, i.desc?.tr, cat.name].join(' '));
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function hl(text) {
    const s = esc(text);
    if (!state.q.trim()) return s;
    const q = state.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try { return s.replace(new RegExp(`(${q})`, 'ig'), '<mark>$1</mark>'); } catch { return s; }
  }

  function itemHTML(i, ci) {
    const badge = i.badge === 'signature' ? `<span class="badge">${t('signature')}</span>` : i.badge === 'new' ? `<span class="badge new">${t('new')}</span>` : '';
    const als = (i.allergens || []).map((a) => gkAllergenIcon(a)).join('');
    const sold = i.available === false;
    return `<button type="button" class="item ${badge ? 'has-badge' : ''} ${i.image ? 'has-thumb' : ''} ${sold ? 'sold' : ''}" data-id="${esc(i.id)}" data-c="${ci}">
      ${badge}
      <span class="item-main">
        <h3>${hl(i.name)}</h3>
        <span class="desc">${hl(L(i.desc))}</span>
        <span class="item-foot">
          <span class="kcal">${Number(i.kcal || 0)} ${t('kcal')}</span>
          <span class="als">${als}</span>
          ${sold ? `<span class="soldtag">${t('sold')}</span>` : ''}
          <span class="price">${fmtPrice(i.price)}</span>
        </span>
      </span>
      ${i.image ? `<img class="thumb" src="${esc(i.image)}" alt="" loading="lazy" />` : ''}
    </button>`;
  }

  function render() {
    const cats = state.menu.categories.filter((c) => !c.hidden);
    let total = 0;
    const html = cats.map((c, ci) => {
      const items = visibleItems(c);
      total += items.length;
      if (!items.length) return '';
      return `<section class="sec" id="c-${esc(c.id)}" data-cat="${esc(c.id)}">
        <div class="sec-head">
          <span class="sec-num">${String(ci + 1).padStart(2, '0')}</span>
          <div><h2>${esc(c.name)}</h2><p>${esc(L(c.subtitle))}</p></div>
        </div>
        <div class="items">${items.map((i) => itemHTML(i, state.menu.categories.indexOf(c))).join('')}</div>
      </section>`;
    }).join('');
    $('#menu').innerHTML = html;
    $('#empty').hidden = total > 0;
    $('#empty').textContent = t('empty');
    $('#cats').innerHTML = cats.map((c) => `<button type="button" data-go="${esc(c.id)}">${esc(c.name)}</button>`).join('');
    $('#filterDot').hidden = !(state.exclude.size || state.sigOnly);
    $('#btnFilter').classList.toggle('on', Boolean(state.exclude.size || state.sigOnly));
    spy();
  }

  /* ---------- open now ---------- */
  function updateStatus() {
    const b = state.menu.brand;
    const now = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const m = (s) => { const [h, mi] = String(s).split(':').map(Number); return h * 60 + (mi || 0); };
    const n = m(now), o = m(b.open), c = m(b.close);
    const open = c > o ? n >= o && n < c : n >= o || n < c;
    const el = $('#status');
    el.classList.toggle('closed', !open);
    el.querySelector('span').textContent = open ? `${t('open')} · ${b.close} ${t('closesAt')}` : `${t('closed')} · ${b.open} ${t('opensAt')}`;
  }

  /* ---------- scroll spy ---------- */
  let spyObs;
  function spy() {
    spyObs?.disconnect();
    spyObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.cat;
        $$('#cats button').forEach((b) => {
          const on = b.dataset.go === id;
          b.classList.toggle('on', on);
          if (on) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.sec').forEach((s) => spyObs.observe(s));
    const first = $('#cats button'); if (first && !$('#cats button.on')) first.classList.add('on');
  }

  /* ---------- sheets ---------- */
  function openSheet(id) { const s = $(id); s.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeSheet(s) { s.hidden = true; document.body.style.overflow = ''; }

  function openItem(ci, id) {
    const c = state.menu.categories[ci];
    const i = c?.items.find((x) => x.id === id);
    if (!i) return;
    const als = i.allergens || [];
    $('#itemBody').innerHTML = `
      ${i.image ? `<img class="ihero" src="${esc(i.image)}" alt="${esc(i.name)}" />` : ''}
      <p class="eyebrow" style="text-align:left;margin:0 0 6px">${esc(c.name)}</p>
      <h3>${esc(i.name)}</h3>
      <p class="idesc">${esc(L(i.desc))}</p>
      <div class="irow"><span>${t('price')}</span><span class="price">${fmtPrice(i.price)}</span></div>
      <div class="irow"><span>${t('energy')}</span><b>${Number(i.kcal || 0)} ${t('kcal')}</b></div>
      <div class="irow" style="display:block">
        <span>${t('contains')}</span>
        ${als.length ? `<div class="ial">${als.map((a) => `<div>${gkAllergenIcon(a)}<span>${esc(GK_ALLERGEN_MAP[a]?.[state.lang] || a)}</span></div>`).join('')}</div>` : `<p class="ok">✓ ${t('noAllergen')}</p>`}
      </div>`;
    openSheet('#itemSheet');
  }

  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (el.hidden = true), 2200);
  }

  /* ---------- events ---------- */
  function bind() {
    $('#cats').addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      document.getElementById('c-' + b.dataset.go)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('#btnSearch').addEventListener('click', () => {
      const sb = $('#searchbar'); sb.hidden = !sb.hidden;
      $('#btnSearch').classList.toggle('on', !sb.hidden);
      if (!sb.hidden) $('#q').focus(); else { state.q = ''; $('#q').value = ''; render(); }
    });
    let qt;
    $('#q').addEventListener('input', (e) => {
      clearTimeout(qt);
      qt = setTimeout(() => {
        state.q = e.target.value; render();
        if (state.q.trim()) {
          const n = state.menu.categories.reduce((s, c) => s + visibleItems(c).length, 0);
          toast(t('results', n));
          $('#menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 160);
    });
    $('#qClose').addEventListener('click', () => $('#btnSearch').click());
    $('#btnFilter').addEventListener('click', () => openSheet('#filterSheet'));
    $('#fgrid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-al]'); if (!b) return;
      const k = b.dataset.al;
      state.exclude.has(k) ? state.exclude.delete(k) : state.exclude.add(k);
      b.classList.toggle('on'); b.setAttribute('aria-pressed', state.exclude.has(k));
      render();
    });
    $('#fSig').addEventListener('change', (e) => { state.sigOnly = e.target.checked; render(); });
    $('#fClear').addEventListener('click', () => { state.exclude.clear(); state.sigOnly = false; $('#fSig').checked = false; applyStatic(); render(); });
    $$('.sheet').forEach((s) => s.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(s); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.sheet:not([hidden])').forEach(closeSheet); });
    $('#menu').addEventListener('click', (e) => {
      const it = e.target.closest('.item'); if (it) openItem(Number(it.dataset.c), it.dataset.id);
    });
    $('#falBtn').addEventListener('click', () => {
      const cup = $('#falCup');
      cup.classList.add('flip');
      const p = $('#falText'); p.classList.remove('reveal'); p.textContent = '…';
      setTimeout(() => {
        const list = FORTUNES[state.lang];
        let i; do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === state.lastFal);
        state.lastFal = i;
        p.textContent = list[i]; p.classList.add('reveal');
        $('#falBtn').textContent = t('falAgain');
        cup.classList.remove('flip');
      }, 1100);
    });
    setInterval(updateStatus, 60000);
  }
  function resetFal() { $('#falText').classList.remove('reveal'); }

  /* ---------- boot ---------- */
  (async () => {
    $('#menu').innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    try {
      state.menu = await loadMenu();
    } catch (e) {
      $('#menu').innerHTML = '<p class="empty">Menü yüklenemedi. Lütfen tekrar deneyin.</p>';
      return;
    }
    applyStatic(); render(); bind();
  })();
})();
