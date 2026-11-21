const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const noresult = document.getElementById('noresult');
let characters = [];

function previewOf(imgPath) {
  return 'previews/' + imgPath.split('/').pop().replace(/\.(png|webp)$/i, '.jpg');
}

function render(list) {
  grid.innerHTML = '';
  for (const c of list) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = c.img;
    a.setAttribute('download', '');
    a.title = 'Download ' + c.name + ' (full quality)';
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
    dl.textContent = 'GET ↓';
    meta.append(name, dl);
    a.append(img, meta);
    grid.appendChild(a);
  }
  countEl.textContent = list.length + (list.length === 1 ? ' CHARACTER' : ' CHARACTERS');
  noresult.hidden = list.length !== 0;
}

searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  render(q ? characters.filter(c => c.name.toLowerCase().includes(q)) : characters);
});

fetch('characters.json')
  .then(r => r.json())
  .then(data => { characters = data; render(characters); })
  .catch(() => { countEl.textContent = ''; noresult.hidden = false; });
