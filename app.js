const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const noresult = document.getElementById('noresult');
let characters = [];
let shown = [];
let current = -1;

const X_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';

function previewOf(imgPath) {
  return 'previews/' + imgPath.split('/').pop().replace(/\.(png|webp)$/i, '.jpg');
}

function xLink(handle, cls) {
  const a = document.createElement('a');
  a.className = cls;
  a.href = 'https://x.com/' + handle;
  a.target = '_blank';
  a.rel = 'noopener';
  a.title = '@' + handle + ' on X';
  a.innerHTML = X_ICON + '<span>@' + handle + '</span>';
  a.addEventListener('click', e => e.stopPropagation());
  return a;
}

function render(list) {
  shown = list;
  grid.innerHTML = '';
  list.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Open ' + c.name);
    const img = document.createElement('img');
    img.src = previewOf(c.img);
    img.alt = c.name;
    img.loading = 'lazy';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = c.name;
    const dl = document.createElement('span');
    dl.className = 'dl';
    dl.textContent = 'VIEW';
    meta.append(name, dl);
    card.append(img);
    if (c.x) card.append(xLink(c.x, 'xbadge'));
    card.append(meta);
    card.addEventListener('click', () => openLightbox(i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
    grid.appendChild(card);
  });
  countEl.textContent = list.length + (list.length === 1 ? ' CHARACTER' : ' CHARACTERS');
  noresult.hidden = list.length !== 0;
}

/* ---------- LIGHTBOX ---------- */
const lb = document.createElement('div');
lb.className = 'lightbox';
lb.hidden = true;
lb.innerHTML = '<button class="lb-close" aria-label="Close">×</button>' +
  '<button class="lb-nav lb-prev" aria-label="Previous">‹</button>' +
  '<figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"><span class="lb-name"></span><span class="lb-actions"></span></figcaption></figure>' +
  '<button class="lb-nav lb-next" aria-label="Next">›</button>';
document.body.appendChild(lb);
const lbImg = lb.querySelector('.lb-img');
const lbName = lb.querySelector('.lb-name');
const lbActions = lb.querySelector('.lb-actions');

function openLightbox(i) {
  if (!shown.length) return;
  current = (i + shown.length) % shown.length;
  const c = shown[current];
  lbImg.src = previewOf(c.img);           // instant low-res
  const full = new Image();
  full.onload = () => { if (shown[current] === c) lbImg.src = c.img; };
  full.src = c.img;
  lbImg.alt = c.name;
  lbName.textContent = c.name;
  lbActions.innerHTML = '';
  if (c.x) lbActions.append(xLink(c.x, 'lb-x'));
  const dl = document.createElement('a');
  dl.className = 'lb-dl';
  dl.href = c.img;
  dl.setAttribute('download', '');
  dl.textContent = 'DOWNLOAD ↓';
  lbActions.append(dl);
  lb.hidden = false;
  void lb.offsetWidth; lb.classList.add('open');
  document.body.classList.add('lb-lock');
}
function closeLightbox() {
  lb.classList.remove('open');
  document.body.classList.remove('lb-lock');
  setTimeout(() => { if (!lb.classList.contains('open')) lb.hidden = true; }, 180);
  current = -1;
}
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-fig')) closeLightbox(); });
lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); openLightbox(current - 1); });
lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); openLightbox(current + 1); });
document.addEventListener('keydown', e => {
  if (current < 0) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') openLightbox(current - 1);
  if (e.key === 'ArrowRight') openLightbox(current + 1);
});
let tx = null;
lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (Math.abs(dx) > 50) openLightbox(current + (dx < 0 ? 1 : -1));
});

searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  render(q ? characters.filter(c => c.name.toLowerCase().includes(q) || (c.x || '').toLowerCase().includes(q)) : characters);
});

fetch('characters.json')
  .then(r => r.json())
  .then(data => { characters = data; render(characters); })
  .catch(() => { countEl.textContent = ''; noresult.hidden = false; });
