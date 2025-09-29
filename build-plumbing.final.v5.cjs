/**
 * build-plumbing.final.v5.cjs
 * يبني servicesPlumbingData.final.json من صفحة "فني صحي" بنفس الترتيب (1..11 صفحات).
 * - بدون أي dedupe بالعُنوان/slug (فقط يمنع تكرار نفس URL لو حصل).
 * - text = المقتطف بالظبط من الكارت.
 * - sections[0] = مقدّمة قبل أول H2/H3... وعنوانها = عنوان المقال.
 * - باقي السكاشن: كل عنوان فرعي مع فقراته وbullets بالترتيب، ids = "1","2","3"...
 * - text2 = المقدّمة، text3 = أول سكشن بعد المقدّمة (لو موجود).
 * - img = أول صورة بالمقال (أو og:image) وتتحفظ في public/image/<slug>.<ext>
 * - link = "/services/plumbing", slug عربي، metaDescription ~160 من text2
 * - map من أي Google Maps داخل المقال، وإلا افتراضي الكويت.
 */
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;

const BASE = "https://zahrat-khaleej.com/alkwait";
const CAT = BASE + "/category/%D9%81%D9%86%D9%8A-%D8%B5%D8%AD%D9%8A/";
const OUT_JSON = path.resolve(__dirname, "servicesPlumbingData.final.json");
const IMG_DIR = path.resolve(__dirname, "public/image");
const MAX_PAGES = 11;

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const UA = {
  "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
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
  const r = await axios.get(url, { headers: UA, timeout: 45000, validateStatus:s=>s<500 });
  return r.data;
}
function parseCategoryCards(html){
  const $ = cheerio.load(html);
  const cards = [];
  const seenUrl = new Set();
  $("article, .post, .archive .hentry, .blog .hentry").each((_, el)=>{
    const $el = $(el);
    const a = $el.find("h2 a, h3 a, .entry-title a, .post-title a").first();
    const title = norm(a.text());
    const url = a.attr("href")||"";
    // خُد المقتطف من نفس الكارت:
    let excerpt = norm(
      $el.find(".entry-summary, .post-excerpt, .archive-excerpt").first().text() ||
      $el.find(".entry-content").first().text() ||
      $el.find("p").first().text()
    ).replace(/أكمل القراءة.?$/,"").trim();
    if (title && url && !seenUrl.has(url)) {
      cards.push({ title, url, excerpt });
      seenUrl.add(url);
    }
  });
  // fallback لو ثيم مختلف
  if (!cards.length) {
    $("h2.entry-title, h3.entry-title, .entry-title").each((_, h)=>{
      const $h = $(h); const a = $h.find("a").first();
      const title = norm(a.text()); const url = a.attr("href")||"";
      let excerpt = norm($h.closest("article").find(".entry-summary, .entry-content, p").first().text());
      excerpt = excerpt.replace(/أكمل القراءة.?$/,"").trim();
      if (title && url && !seenUrl.has(url)) { cards.push({title,url,excerpt}); seenUrl.add(url); }
    });
  }
  return cards;
}
function firstImageFrom($root, $doc){
  let src = $root.find("img").first().attr("data-src") || $root.find("img").first().attr("src") || "";
  if (!src) {
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
    const src = $(el).attr("src"); if (!link && src) link = src;
  });
  if (!link){
    $("a[href*='google.com/maps'], a[href*='maps.app.goo.gl'], a[href*='goo.gl/maps']").each((_, el)=>{
      const href = $(el).attr("href"); if (!link && href) link = href;
    });
  }
  if (!link) return DEFAULT_MAP;
  const toAbs = u => u.startsWith("//") ? "https:" + u : (u.startsWith("/")? BASE+u : u);
  const abs = toAbs(link);
  const at = abs.match(/@(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
  const urlObj = (()=>{ try{ return new URL(abs); }catch{ return null; } })();
  const getPair = s => { const m=(s||"").match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/); return m?[parseFloat(m[1]),parseFloat(m[3])]:null; };
  let lat = DEFAULT_MAP.lat, lng = DEFAULT_MAP.lng;
  if (at){ lat=parseFloat(at[1]); lng=parseFloat(at[3]); }
  else if (urlObj){ const v = getPair(urlObj.searchParams.get("ll")||urlObj.searchParams.get("center")||urlObj.searchParams.get("q")); if (v){ lat=v[0]; lng=v[1]; } }
  const q = urlObj?.searchParams.get("q") || "";
  const enc = q ? encodeURIComponent(q) : `${lat},${lng}`;
  return { title: "زهرة الكويت – الكويت", link: abs, embedUrl: `https://www.google.com/maps?q=${enc}&hl=ar&output=embed`, lat, lng };
}
function splitIntroAndSections($content, title){
  const sections = [];
  const introParts = [];
  const children = $content.children().toArray();
  let i = 0;
  // جمع المقدّمة لحد أول heading
  while (i < children.length){
    const tag = (children[i].tagName||"").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)) break;
    const $el = cheerio.load(children[i], null, false).root();
    const t = norm($el.text()); if (t) introParts.push(t);
    i++;
  }
  sections.push({ id: "1", heading: title, text: introParts.join("\n\n") });
  // بقية السكاشن
  let idx = 2;
  while (i < children.length){
    const node = children[i];
    const tag = (node.tagName||"").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)){
      const $h = cheerio.load(node, null, false).root();
      const heading = norm($h.text());
      let text = ""; const bullets = [];
      i++;
      while (i < children.length){
        const tnode = children[i];
        const ttag = (tnode.tagName||"").toLowerCase();
        if (["h1","h2","h3","h4"].includes(ttag)) break;
        const $el = cheerio.load(tnode, null, false).root();
        if (ttag === "p"){
          const para = norm($el.text()); if (para) text += (text? "\n\n":"") + para;
        } else if (ttag === "ul" || ttag === "ol"){
          $el.find("li").each((__, li)=>{
            const $li = cheerio.load(li, null, false).root();
            const v = norm($li.text()); if (v) bullets.push(v);
          });
        } else {
          const plain = norm($el.text()); if (plain) text += (text? "\n\n":"") + plain;
        }
        i++;
      }
      const sec = { id: String(idx), heading, text };
      if (bullets.length) sec.bullets = bullets;
      sections.push(sec); idx++; continue;
    }
    i++;
  }
  return sections;
}

(async ()=>{
  // 1) اجمع كل كروت التصنيف بالترتيب عبر الصفحات
  const cards = [];
  for (let p=1; p<=MAX_PAGES; p++){
    const url = p===1 ? CAT : CAT + "page/" + p + "/";
    const html = await fetchHTML(url);
    const list = parseCategoryCards(html);
    cards.push(...list);
  }

  // 2) زر كل مقال وابني السجل
  const q = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });
  const results = [];
  for (let i=0; i<cards.length; i++){
    const c = cards[i]; const idx = i+1;
    await q.add(async ()=>{
      const html = await fetchHTML(c.url);
      const $ = cheerio.load(html);
      const content = $(".entry-content").first().length
        ? $(".entry-content").first()
        : $("article .entry, .post-content, .single-content").first();

      const sections = splitIntroAndSections(content, c.title);
      const text  = c.excerpt;
      const text2 = sections[0]?.text || text || c.title;
      const text3 = sections[1]?.text || "";

      // صورة
      let imgUrl = firstImageFrom(content, $) || "";
      let img = "";
      if (imgUrl){
        const ext = path.extname(imgUrl.split("?")[0]) || ".jpg";
        const fname = `${arabicSlug(c.title)}${ext}`;
        const full = path.join(IMG_DIR, fname);
        try{
          if (!fs.existsSync(full)){
            const res = await axios.get(imgUrl, { responseType:"arraybuffer", headers: UA, timeout: 60000 });
            fs.writeFileSync(full, res.data);
          }
          img = `/image/${fname}`;
        }catch{ img = ""; }
      }

      // خريطة
      const map = extractMap($);

      const base = (text2 || text || c.title);
      const meta = base.length <= 160 ? base : (base.slice(0, base.lastIndexOf(" ", 160)) || base.slice(0,160)) + "…";

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

