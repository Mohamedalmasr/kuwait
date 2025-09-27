/**
 * Build FINAL servicesPlumbingData.json (v4) — matches category + inner-page sequence.
 * id: order across pages (1..106)
 * title: card title
 * text: exact card excerpt
 * sections:
 *   - section[0] => intro (everything before first H2/H3...), heading = title
 *   - section[n] => each H2/H3/H4 block with its paragraphs & bullets
 *   - ids are "1","2","3",... (sequential)
 * text2 = sections[0].text
 * text3 = sections[1]?.text || ""
 * img: first article img (or og:image) saved to /public/image/<slug>.<ext>
 * link: '/services/plumbing'
 * slug: Arabic clean
 * metaDescription: ~160 chars from text2
 * map: from google maps link/iframe; default Kuwait otherwise
 *
 * USAGE (project root):
 *   npm i axios cheerio p-queue
 *   node build-plumbing.final.v4.cjs
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
  const seenUrl = new Set();
  $("article, .post, .archive .hentry, .blog .hentry").each((_, el)=>{
    const $el = $(el);
    const a = $el.find("h2 a, h3 a, .entry-title a, .post-title a").first();
    const title = norm(a.text());
    const url = a.attr("href") || "";
    let excerpt = norm($el.find(".entry-summary, .entry-content, .post-excerpt, .archive-excerpt, p").first().text());
    excerpt = excerpt.replace(/أكمل القراءة.?$/,"").trim();
    let img = $el.find("img").first().attr("data-src") || $el.find("img").first().attr("src") || "";
    if (img && img.startsWith("//")) img = "https:" + img;
    if (img && img.startsWith("/")) img = BASE + img;
    if (title && url && !seenUrl.has(url)){
      cards.push({ title, url, excerpt, img });
      seenUrl.add(url);
    }
  });
  // Fallback headings if some missed
  $("h2.entry-title, h3.entry-title, .entry-title").each((_, h)=>{
    const a = cheerio(h).find("a").first();
    const title = norm(a.text());
    const url = a.attr("href") || "";
    const wrap = cheerio(h).closest("article");
    let excerpt = wrap.length ? norm(wrap.find(".entry-summary, .entry-content, p").first().text())
                              : norm(cheerio(h).nextAll("p").first().text());
    excerpt = excerpt.replace(/أكمل القراءة.?$/,"").trim();
    if (title && url && !seenUrl.has(url)){
      cards.push({ title, url, excerpt, img: "" });
      seenUrl.add(url);
    }
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

function splitIntroAndSections($content, title){
  // Gather intro until first heading
  const sections = [];
  const introParts = [];
  const children = $content.children().toArray();
  let i = 0;
  while (i < children.length){
    const tag = (children[i].tagName || "").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)) break;
    const $el = cheerio.load(children[i], null, false).root();
    const t = norm($el.text());
    if (t) introParts.push(t);
    i++;
  }
  const introText = introParts.join("\n\n");
  sections.push({ id: "1", heading: title, text: introText });

  // Now parse subsequent sections by headings
  let secIndex = 2;
  while (i < children.length){
    const node = children[i];
    const tag = (node.tagName || "").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)){
      const heading = norm(cheerio.load(node, null, false).root().text());
      let text = "";
      const bullets = [];
      i++;
      while (i < children.length){
        const tnode = children[i];
        const ttag = (tnode.tagName || "").toLowerCase();
        if (["h1","h2","h3","h4"].includes(ttag)) break;
        const $el = cheerio.load(tnode, null, false).root();
        if (ttag === "p"){
          const para = norm($el.text());
          if (para) text += (text ? "\n\n" : "") + para;
        } else if (ttag === "ul" || ttag === "ol"){
          $el.find("li").each((__, li)=>{
            const v = norm(cheerio(li).text()); if (v) bullets.push(v);
          });
        } else {
          const plain = norm($el.text());
          if (plain) text += (text ? "\n\n" : "") + plain;
        }
        i++;
      }
      const sec = { id: String(secIndex), heading, text };
      if (bullets.length) sec.bullets = bullets;
      sections.push(sec);
      secIndex++;
      continue;
    }
    i++;
  }
  return sections;
}

(async ()=>{
  // 1) collect all cards, page by page (preserve order, no cross-page dedupe)
  const cards = [];
  for (let p=1; p<=MAX_PAGES; p++){
    const url = p===1 ? CATEGORY : `${CATEGORY}page/${p}/`;
    const html = await fetchHTML(url);
    const list = parseCategoryCards(html);
    cards.push(...list);
  }

  // 2) visit each article and build
  const q = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });
  const results = [];
  for (let i=0; i<cards.length; i++){
    const c = cards[i];
    await q.add(async ()=>{
      const idx = i+1;
      const html = await fetchHTML(c.url);
      const $ = cheerio.load(html);
      const content = $(".entry-content").first().length
        ? $(".entry-content").first()
        : $("article .entry, .post-content, .single-content").first();

      const sections = splitIntroAndSections(content, c.title);
      const text = c.excerpt;
      const text2 = sections[0]?.text || text || c.title;
      const text3 = sections[1]?.text || "";

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