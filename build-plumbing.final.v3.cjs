/**
 * Build FINAL servicesPlumbingData.json (v3) per your exact methodology:
 * - id: 1..106 (order of category pages)
 * - title: from category card
 * - text: EXACT excerpt shown in category card
 * - text2: full text of the FIRST section inside article
 * - text3: full text of the SECOND section (if exists), else ""
 * - sections: derived from article H2/H3/H4 + paragraphs + bullets; BUT each section.id = "1"
 * - img: article first image or og:image -> saved as /public/image/<arabic-slug>.<ext>
 * - link: '/services/plumbing'
 * - slug: Arabic clean (spaces -> '-')
 * - metaDescription: ~160 chars from (text2 || text || title)
 * - map: from google maps link/iframe if present, else default Kuwait
 *
 * USAGE (from project root):
 *   npm i axios cheerio p-queue
 *   node build-plumbing.final.v3.cjs
 *
 * OUTPUT:
 *   servicesPlumbingData.final.json   (in project root)
 *   images under public/image/
 */
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;

const BASE = "https://zahrat-khaleej.com/alkwait";
const CATEGORY = `${BASE}/category/%D9%81%D9%86%D9%8A-%D8%B5%D8%AD%D9%8A/`;
const OUT_JSON = path.resolve(__dirname, "servicesPlumbingData.final.json");
const IMG_DIR = path.resolve(__dirname, "public/image");
const MAX_PAGES = 11;

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const UA = {
  "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language":"ar,en;q=0.9"
};

const DEFAULT_MAP = {
  title: "زهرة الكويت – الكويت",
  link: "https://maps.google.com/?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar",
  embedUrl: "https://www.google.com/maps?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar&output=embed",
  lat: 29.34562843865095,
  lng: 47.38155420092979
};

const norm = s => (s||"").normalize("NFKC").replace(/\u200e|\u200f/g,"").replace(/\s+/g," ").trim();
const arabicSlug = t => norm(t).replace(/[^\u0621-\u064A0-9\- ]+/g,"").replace(/\s+/g,"-");

async function fetchHTML(url){
  const r = await axios.get(url, { headers: UA, timeout: 40000, decompress: true, validateStatus:s=>s<500 });
  return r.data;
}

function parseCategoryCards(html){
  const $ = cheerio.load(html);
  const cards = [];
  $("article, .post, .archive .hentry, .blog .hentry").each((_, el)=>{
    const $el = $(el);
    const titleA = $el.find("h2 a, h3 a, .entry-title a, .post-title a").first();
    const title = norm(titleA.text());
    const url = titleA.attr("href") || "";
    let excerpt = norm($el.find(".entry-summary, .entry-content, .post-excerpt, .archive-excerpt, p").first().text());
    excerpt = excerpt.replace(/أكمل القراءة.?$/,"").trim();
    let img = $el.find("img").first().attr("data-src") || $el.find("img").first().attr("src") || "";
    if (!img) img = $("meta[property='og:image']").attr("content") || $("meta[name='twitter:image']").attr("content") || "";
    if (img && img.startsWith("//")) img = "https:" + img;
    if (img && img.startsWith("/")) img = BASE + img;
    if (title && url) cards.push({ title, url, excerpt, img });
  });
  // Fallback
  $("h2.entry-title, h3.entry-title, .entry-title").each((_, h)=>{
    const a = cheerio(h).find("a").first();
    const title = norm(a.text());
    const url = a.attr("href") || "";
    const wrap = cheerio(h).closest("article");
    let excerpt = wrap.length ? norm(wrap.find(".entry-summary, .entry-content, p").first().text())
                              : norm(cheerio(h).nextAll("p").first().text());
    excerpt = excerpt.replace(/أكمل القراءة.?$/,"").trim();
    if (title && url && !cards.find(c=>c.title===title)) cards.push({ title, url, excerpt, img: "" });
  });
  return cards;
}

function firstImageFrom($root, $doc){
  let src = $root.find("img").first().attr("data-src") || $root.find("img").first().attr("src") || "";
  if (!src){
    const og = $doc("meta[property='og:image']").attr("content") || $doc("meta[name='twitter:image']").attr("content") || "";
    src = og || "";
  }
  if (src && src.startsWith("//")) src = "https:" + src;
  if (src && src.startsWith("/")) src = BASE + src;
  return src;
}

function extractMap($){
  let link = "";
  $("iframe[src*='google.com/maps'], iframe[src*='google.com/embed']").each((_, el)=>{
    const src = cheerio(el).attr("src");
    if (!link && src) link = src;
  });
  if (!link){
    $("a[href*='google.com/maps'], a[href*='maps.app.goo.gl'], a[href*='goo.gl/maps']").each((_, el)=>{
      const href = cheerio(el).attr("href");
      if (!link && href) link = href;
    });
  }
  if (!link) return DEFAULT_MAP;
  const toAbs = (u)=> u.startsWith("//") ? "https:" + u : (u.startsWith("/")? BASE+u : u);
  const abs = toAbs(link);
  const at = abs.match(/@(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
  const urlObj = (()=>{ try { return new URL(abs); } catch { return null; } })();
  const getPair = (s)=>{
    const m = (s||"").match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
    return m ? [parseFloat(m[1]), parseFloat(m[3])] : null;
  };
  let lat = DEFAULT_MAP.lat, lng = DEFAULT_MAP.lng;
  if (at) { lat = parseFloat(at[1]); lng = parseFloat(at[3]); }
  else if (urlObj){
    const v = getPair(urlObj.searchParams.get("ll") || urlObj.searchParams.get("center") || urlObj.searchParams.get("q"));
    if (v) { lat = v[0]; lng = v[1]; }
  }
  const q = urlObj?.searchParams.get("q") || "";
  const enc = q ? encodeURIComponent(q) : `${lat},${lng}`;
  return {
    title: "زهرة الكويت – الكويت",
    link: abs,
    embedUrl: `https://www.google.com/maps?q=${enc}&hl=ar&output=embed`,
    lat, lng
  };
}

function buildSections($content){
  const sections = [];
  let current = { heading: "", text: "", bullets: [] };
  $content.children().each((_, el)=>{
    const $el = cheerio.load(el, null, false).root();
    const tag = ($el.get(0)?.tagName || "").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)){
      if (current.heading || current.text || current.bullets.length){
        const s = { id: "1", heading: norm(current.heading), text: norm(current.text) };
        if (current.bullets.length) s.bullets = current.bullets.slice(0, 100);
        sections.push(s);
      }
      current = { heading: norm($el.text()), text: "", bullets: [] };
    } else if (tag === "p"){
      const t = norm($el.text());
      if (t) current.text += (current.text ? "\\n\\n" : "") + t;
    } else if (tag === "ul" || tag === "ol"){
      $el.find("li").each((__, li)=>{
        const t = norm(cheerio(li).text());
        if (t) current.bullets.push(t);
      });
    } else {
      const t = norm($el.text());
      if (t) current.text += (current.text ? "\\n\\n" : "") + t;
    }
  });
  if (current.heading || current.text || current.bullets.length){
    const s = { id: "1", heading: norm(current.heading), text: norm(current.text) };
    if (current.bullets.length) s.bullets = current.bullets.slice(0, 100);
    sections.push(s);
  }
  if (!sections.length){
    sections.push({ id: "1", heading: "", text: norm($content.text()) });
  }
  // Enforce ALL ids = "1"
  for (const s of sections) s.id = "1";
  return sections;
}

(async ()=>{
  // 1) Collect all cards across pages
  const cards = [];
  for (let p=1; p<=MAX_PAGES; p++){
    const url = p===1 ? CATEGORY : `${CATEGORY}page/${p}/`;
    const html = await fetchHTML(url);
    const arr = parseCategoryCards(html);
    cards.push(...arr);
  }
  // dedupe by title preserving order
  const seen = new Set();
  const ordered = [];
  for (const c of cards){
    if (!seen.has(c.title)) { ordered.push(c); seen.add(c.title); }
  }

  // 2) Visit each article and build record with your rules
  const q = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });
  const results = [];
  let idx = 0;
  for (const c of ordered){
    idx += 1;
    await q.add(async ()=>{
      const html = await fetchHTML(c.url);
      const $ = cheerio.load(html);
      const content = $(".entry-content").first().length
        ? $(".entry-content").first()
        : $("article .entry, .post-content, .single-content").first();

      const sections = buildSections(content);
      const text = c.excerpt; // exact card excerpt
      const text2 = sections[0]?.text || text || c.title;
      const text3 = sections[1]?.text || "";

      // image
      let imgUrl = firstImageFrom(content, $) || c.img || "";
      let img = "";
      if (imgUrl){
        const ext = path.extname(imgUrl.split("?")[0]) || ".jpg";
        const fname = `${arabicSlug(c.title)}${ext}`;
        const full = path.join(IMG_DIR, fname);
        try{
          if (!fs.existsSync(full)){
            const res = await axios.get(imgUrl, { responseType: "arraybuffer", headers: UA, timeout: 60000 });
            fs.writeFileSync(full, res.data);
          }
          img = `/image/${fname}`;
        }catch{ img=""; }
      }

      const map = extractMap($);

      const fullForMeta = (text2 || text || c.title);
      const meta = fullForMeta.length <= 160 ? fullForMeta : (fullForMeta.slice(0, fullForMeta.lastIndexOf(" ", 160)) || fullForMeta.slice(0,160)) + "…";

      results.push({
        id: idx,
        title: c.title,
        text,
        text2,
        text3,
        img,
        link: "/services/plumbing",
        slug: arabicSlug(c.title),
        metaDescription: meta,
        sections,
        map
      });
    });
  }
  await q.onIdle();

  results.sort((a,b)=>a.id-b.id);
  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2), "utf8");
  console.log("✅ Saved:", OUT_JSON, "Items:", results.length);
})();