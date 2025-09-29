const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, 'src/data/servicesPlumbingData.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const seen = new Map();

for (const item of data) {
  const base = (item.slug || '').trim();
  if (!base) continue;

  if (!seen.has(base)) {
    seen.set(base, 1);
  } else {
    let n = seen.get(base) + 1;
    let candidate = `${base}-${n}`;
    while (data.some(o => o !== item && o.slug === candidate)) {
      n++;
      candidate = `${base}-${n}`;
    }
    item.slug = candidate;
    seen.set(base, n);
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fixed duplicate slugs');
