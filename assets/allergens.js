// Allergen definitions shared by the public menu and the admin panel.
// Icons are hand drawn 24x24 SVGs, rendered in cream on a coloured tile.
window.GK_ALLERGENS = [
  {
    key: 'peanut', color: '#d39a3a',
    mn: 'Газрын самар', tr: 'Yer fıstığı',
    svg: '<ellipse cx="12" cy="7.6" rx="4.3" ry="4.6"/><ellipse cx="12" cy="15.6" rx="4.9" ry="5.2"/><circle cx="10.4" cy="7" r=".8" style="fill:var(--tile)"/><circle cx="13.4" cy="8.6" r=".8" style="fill:var(--tile)"/><circle cx="10.6" cy="15" r=".8" style="fill:var(--tile)"/><circle cx="13.6" cy="16.8" r=".8" style="fill:var(--tile)"/>'
  },
  {
    key: 'treenut', color: '#b06a32',
    mn: 'Самар', tr: 'Kabuklu yemişler',
    svg: '<rect x="11.1" y="1.6" width="1.8" height="3.4" rx=".9"/><path d="M4.6 10.4C4.6 6.8 7.9 4.4 12 4.4s7.4 2.4 7.4 6z"/><path d="M6.3 11.6h11.4c0 4.9-2.6 8.6-5.7 9.8-3.1-1.2-5.7-4.9-5.7-9.8z"/>'
  },
  {
    key: 'crustacean', color: '#c0503a',
    mn: 'Хавч', tr: 'Kabuklular',
    svg: '<ellipse cx="12" cy="14.2" rx="5.6" ry="3.9"/><path d="M4.2 4.6c-1.9 1.6-1.5 4.4.7 5.2l1.6-2.2-1.5-.4 1.3-1.6zM19.8 4.6c1.9 1.6 1.5 4.4-.7 5.2l-1.6-2.2 1.5-.4-1.3-1.6z"/><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 9.4l1.6 2.4M18 9.4l-1.6 2.4M6.6 15.4l-3 1.2M6.9 17.2l-2.4 2.4M17.4 15.4l3 1.2M17.1 17.2l2.4 2.4"/></g>'
  },
  {
    key: 'mollusc', color: '#3a8a80',
    mn: 'Нялцгай биет', tr: 'Yumuşakçalar',
    svg: '<path d="M12 21.2 3.2 10.6a8.8 8.8 0 0 1 17.6 0z"/><g fill="none" style="stroke:var(--tile)" stroke-width="1.3" stroke-linecap="round"><path d="M12 20.4V4.2M12 20.4 7.6 5.4M12 20.4 16.4 5.4M12 20.4 4.6 8.6M12 20.4l7.4-11.8"/></g><rect x="9.4" y="19" width="5.2" height="2.6" rx="1"/>'
  },
  {
    key: 'fish', color: '#3a74a3',
    mn: 'Загас', tr: 'Balık',
    svg: '<path d="M2.8 12c2.6-4.2 6.4-6 10-6 3.4 0 5.6 2.4 6.6 6-1 3.6-3.2 6-6.6 6-3.6 0-7.4-1.8-10-6z"/><path d="M18.2 12l3.4-4.2v8.4z"/><circle cx="7.6" cy="11.2" r="1.2" style="fill:var(--tile)"/><path d="M11.6 8.6c1 1.8 1 5 0 6.8" fill="none" style="stroke:var(--tile)" stroke-width="1.2" stroke-linecap="round"/>'
  },
  {
    key: 'egg', color: '#d8ab22',
    mn: 'Өндөг', tr: 'Yumurta',
    svg: '<path d="M12 2.6c3.7 0 6.9 5.8 6.9 10.6a6.9 6.9 0 0 1-13.8 0C5.1 8.4 8.3 2.6 12 2.6z"/><ellipse cx="9.6" cy="9" rx="1.3" ry="2.1" style="fill:var(--tile)" opacity=".55"/>'
  },
  {
    key: 'milk', color: '#8b6b9e',
    mn: 'Сүү', tr: 'Süt',
    svg: '<path d="M9 2.4h6v3.2l2.4 3.6v11.4a1.4 1.4 0 0 1-1.4 1.4H8a1.4 1.4 0 0 1-1.4-1.4V9.2L9 5.6z"/><rect x="6.6" y="11.4" width="10.8" height="4.6" style="fill:var(--tile)" opacity=".5"/><rect x="8.6" y="1.4" width="6.8" height="2" rx=".8"/>'
  },
  {
    key: 'gluten', color: '#96562a',
    mn: 'Цавуулаг', tr: 'Gluten',
    svg: '<path d="M12 22V7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="12" cy="4.4" rx="1.6" ry="2.6"/><ellipse cx="9.4" cy="8.6" rx="1.5" ry="2.6" transform="rotate(-35 9.4 8.6)"/><ellipse cx="14.6" cy="8.6" rx="1.5" ry="2.6" transform="rotate(35 14.6 8.6)"/><ellipse cx="9.4" cy="12.8" rx="1.5" ry="2.6" transform="rotate(-35 9.4 12.8)"/><ellipse cx="14.6" cy="12.8" rx="1.5" ry="2.6" transform="rotate(35 14.6 12.8)"/><ellipse cx="9.4" cy="17" rx="1.5" ry="2.6" transform="rotate(-35 9.4 17)"/><ellipse cx="14.6" cy="17" rx="1.5" ry="2.6" transform="rotate(35 14.6 17)"/>'
  },
  {
    key: 'soy', color: '#5b8636',
    mn: 'Шар буурцаг', tr: 'Soya',
    svg: '<path d="M4 18.6C3 15 6.2 9.6 10.4 6.6c3.2-2.3 6.8-3.6 8.8-2.8 1.6 2-.1 6-2.8 8.8-3.6 3.8-8.8 7.4-12.4 6z"/><circle cx="8.6" cy="14.4" r="1.7" style="fill:var(--tile)"/><circle cx="12" cy="11.2" r="1.7" style="fill:var(--tile)"/><circle cx="15.4" cy="8" r="1.7" style="fill:var(--tile)"/>'
  },
  {
    key: 'sesame', color: '#cf7228',
    mn: 'Гүнжид', tr: 'Susam',
    svg: '<g><ellipse cx="12" cy="5.6" rx="1.9" ry="3"/><ellipse cx="12" cy="5.6" rx="1.9" ry="3" transform="rotate(72 12 12)"/><ellipse cx="12" cy="5.6" rx="1.9" ry="3" transform="rotate(144 12 12)"/><ellipse cx="12" cy="5.6" rx="1.9" ry="3" transform="rotate(216 12 12)"/><ellipse cx="12" cy="5.6" rx="1.9" ry="3" transform="rotate(288 12 12)"/></g><circle cx="12" cy="12" r="1.6"/>'
  },
  {
    key: 'celery', color: '#74983f',
    mn: 'Селдерей', tr: 'Kereviz',
    svg: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 21 15.4 6.2M9.4 21.6 17.8 8.4M3.6 18.4l8.8 -13.6"/></g><circle cx="13.2" cy="3.6" r="2"/><circle cx="16.8" cy="5" r="2"/><circle cx="19.4" cy="7.6" r="1.8"/>'
  },
  {
    key: 'mustard', color: '#b88d1f',
    mn: 'Гич', tr: 'Hardal',
    svg: '<path d="M10.2 1.8h3.6v3.4l1.8 2.6v12.6a1.4 1.4 0 0 1-1.4 1.4H9.8a1.4 1.4 0 0 1-1.4-1.4V7.8l1.8-2.6z"/><rect x="8.4" y="11" width="7.2" height="5.4" style="fill:var(--tile)" opacity=".5"/><path d="M18.6 14.6c.9 1.3 1.4 2.2 1.4 2.9a1.4 1.4 0 0 1-2.8 0c0-.7.5-1.6 1.4-2.9z"/>'
  },
  {
    key: 'lupin', color: '#7562a3',
    mn: 'Люпин', tr: 'Acı bakla',
    svg: '<path d="M12 22v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="12" cy="3.4" rx="1.6" ry="1.6"/><ellipse cx="12" cy="6.8" rx="3" ry="1.7"/><ellipse cx="12" cy="10.4" rx="4" ry="1.8"/><ellipse cx="12" cy="14.2" rx="4.8" ry="1.9"/><path d="M12 19.4c-2.4-2.6-5-2.4-6.2-1.6M12 19.4c2.4-2.6 5-2.4 6.2-1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  },
  {
    key: 'sulphite', color: '#8a2836',
    mn: 'Сульфит', tr: 'Sülfitler',
    svg: '<path d="M6.6 2.4h10.8c.5 5.6-1.6 9.6-5.4 9.6S6.1 8 6.6 2.4z"/><path d="M7.2 6h9.6" style="stroke:var(--tile)" stroke-width="1.2" opacity=".6"/><rect x="11.1" y="11.6" width="1.8" height="7"/><rect x="7.6" y="18.6" width="8.8" height="2.4" rx="1.2"/>'
  }
];
window.GK_ALLERGEN_MAP = Object.fromEntries(window.GK_ALLERGENS.map((a) => [a.key, a]));
window.gkAllergenIcon = function (key, size) {
  const a = window.GK_ALLERGEN_MAP[key];
  if (!a) return '';
  return '<span class="al-tile" style="--tile:' + a.color + ';' + (size ? '--s:' + size + 'px' : '') + '"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + a.svg + '</svg></span>';
};
