/**
 * verify-plumbing.cjs
 * يتحقق إن الملف مطابق للموقع:
 * - Count=106
 * - لا تكرار بالعناوين/السلاجز (إلا لو التكرار مطابق لصفحة التصنيف = Mirror OK)
 * - ترتيب العناوين + المقتطف = صفحة التصنيف
 * - text2 = المقدّمة، text3 = أول سكشن
 * - وجود الصور محلّيًا
 * يخرج تقرير: verify-plumbing.report.json
 */
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const PQueue = require("p-queue").default;

const BASE = "https://zahrat-khaleej.com/alkwait";
const CAT  = BASE + "/category/%D9%81%D9%86%D9%8A-%D8%B5%D8%AD%D9%8A/";
const MAX_PAGES = 11;

const UA = {
  "User-Agent": "Mozilla/5.0",
  "Accept": "text/html",
  "Accept-Language": "ar,en;q=0.9"
};

const norm = s => (s||"").normalize("NFKC").replace(/\u200e|\u200f/g,"").replace(/\s+/g," ").trim();

function loadLocal(){
  const A = path.resolve(__dirname,"src/data/servicesPlumbingData.json");
  const B = path.resolve(__dirname,"servicesPlumbingData.final.json");
  const p = fs.existsSync(A) ? A : (fs.existsSync(B) ? B : null);
  if(!p) throw new Error("لا يوجد ملف داتا.");
  return { path: p, data: JSON.parse(fs.readFileSync(p,"utf8")) };
}

async function fetchHTML(u){
  const r = await axios.get(u, { headers: UA, timeout: 45000, validateStatus: s => s < 500 });
  return r.data;
}

function parseCards(html){
  const $ = cheerio.load(html), cards = [], seen = new Set();
  $("article, .post, .archive .hentry, .blog .hentry").each((_,el)=>{
    const $el = $(el);
    const a = $el.find("h2 a, h3 a, .entry-title a, .post-title a").first();
    const title = norm(a.text());
    const url   = a.attr("href") || "";
    let excerpt = norm(
      $el.find(".entry-summary, .post-excerpt, .archive-excerpt").first().text() ||
      $el.find(".entry-content").first().text() ||
      $el.find("p").first().text()
    ).replace(/أكمل القراءة.?$/,"").trim();
    if (title && url && !seen.has(url)){
      cards.push({ title, url, excerpt });
      seen.add(url);
    }
  });
  return cards;
}

function splitIntroAndSections($content,title){
  const sections = [], intro = [];
  const ch = $content.children().toArray();
  let i = 0;

  while (i < ch.length){
    const t = (ch[i].tagName || "").toLowerCase();
    if (["h1","h2","h3","h4"].includes(t)) break;
    const $el = cheerio.load(ch[i], null, false).root();
    const txt = norm($el.text());
    if (txt) intro.push(txt);
    i++;
  }
  sections.push({ id:"1", heading:title, text:intro.join("\n\n") });

  let idx = 2;
  while (i < ch.length){
    const node = ch[i];
    const tag = (node.tagName || "").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)){
      const $h = cheerio.load(node, null, false).root();
      const heading = norm($h.text());
      let text = "";
      const bullets = [];
      i++;
      while (i < ch.length){
        const n = ch[i];
        const tg = (n.tagName || "").toLowerCase();
        if (["h1","h2","h3","h4"].includes(tg)) break;
        const $el = cheerio.load(n, null, false).root();
        if (tg === "p"){
          const p = norm($el.text());
          if (p) text += (text ? "\n\n" : "") + p;
        } else if (tg === "ul" || tg === "ol"){
          $el.find("li").each((__,li)=>{
            const $li = cheerio.load(li, null, false).root();
            const v = norm($li.text());
            if (v) bullets.push(v);
          });
        } else {
          const t = norm($el.text());
          if (t) text += (text ? "\n\n" : "") + t;
        }
        i++;
      }
      const sec = { id:String(idx), heading, text };
      if (bullets.length) sec.bullets = bullets;
      sections.push(sec);
      idx++;
      continue;
    }
    i++;
  }
  return sections;
}

function buildDupList(arr, keyFn){
  const m = new Map();
  arr.forEach(o=>{
    const k = keyFn(o) || "";
    if (!k) return;
    const v = m.get(k) || [];
    v.push(o);
    m.set(k, v);
  });
  return [...m.entries()]
    .filter(([k,v]) => k && v.length > 1)
    .map(([k,v]) => ({ key: k, ids: v.map(x => x.id ?? x.index ?? null).filter(Boolean) }));
}

(async ()=>{
  const report = {
    summary:{},
    duplicates:{
      byTitle_total:[],
      byTitle_mirrors:[],
      byTitle_real:[],
      bySlug:[]
    },
    categoryDiffs:[],
    articleDiffs:[],
    missingImages:[]
  };

  const { data } = loadLocal();
  report.summary.localCount = data.length;

  // ---- جمع كروت التصنيف (وكمان هنستخدمها للـ mirror check)
  const cards = [];
  for (let p=1; p<=MAX_PAGES; p++){
    const url = p===1 ? CAT : CAT + "page/" + p + "/";
    const html = await fetchHTML(url);
    const list = parseCards(html);
    // ثبّت index للتقارير
    list.forEach((c, i0) => c.index = (p===1?0:( (p-1)*list.length )) + i0 + 1);
    cards.push(...list);
  }
  report.summary.categoryCount = cards.length;

  const N = s => norm(s||"");

  // ---- تكرارات العناوين/السلاجز في المحلي
  report.duplicates.byTitle_total = buildDupList(data.map(o=>({id:o.id, key:N(o.title)})), o=>o.key);
  report.duplicates.bySlug       = buildDupList(data.map(o=>({id:o.id, key:N(o.slug)})),  o=>o.key);

  // ---- تكرارات العناوين في صفحة التصنيف (للمقارنة)
  const catTitleDup = (() => {
    const m = new Map();
    cards.forEach((c, idx)=>{
      const k = N(c.title);
      const v = m.get(k) || [];
      v.push(idx+1);
      m.set(k, v);
    });
    // فقط اللي مكرر فعلاً في التصنيف
    return new Map([...m.entries()].filter(([k,v]) => k && v.length > 1));
  })();

  // قسم التكرارات المحلية إلى mirrored / real
  const mirrored = [];
  const real = [];
  for (const d of report.duplicates.byTitle_total){
    if (catTitleDup.has(N(d.key))) mirrored.push(d);
    else real.push(d);
  }
  report.duplicates.byTitle_mirrors = mirrored;
  report.duplicates.byTitle_real    = real;

  // ---- التحقق من المطابقة مع صفحة التصنيف (عنوان + مقتطف)
  const min = Math.min(cards.length, data.length);
  for (let i=0;i<min;i++){
    const c = cards[i], o = data[i];
    const titleOK   = N(c.title)  === N(o.title);
    const excerptOK = N(c.excerpt)=== N(o.text);
    if (!titleOK || !excerptOK){
      report.categoryDiffs.push({
        index: i+1,
        local: { id:o.id, title:o.title, text:o.text },
        category: { title:c.title, excerpt:c.excerpt, url:c.url },
        problems: [!titleOK?'title':'', !excerptOK?'excerpt':''].filter(Boolean)
      });
    }
  }

  // ---- مقارنة نصوص المقالة (intro/first section)
  const q = new PQueue({ concurrency:3, interval:1000, intervalCap:3 });
  for (let i=0;i<min;i++){
    const c = cards[i], o = data[i];
    await q.add(async ()=>{
      try{
        const html = await fetchHTML(c.url);
        const $ = cheerio.load(html);
        const content = $(".entry-content").first().length
          ? $(".entry-content").first()
          : $("article .entry, .post-content, .single-content").first();
        const sections = splitIntroAndSections(content, c.title);
        const intro = N(sections[0]?.text || "");
        const first = N(sections[1]?.text || "");
        const probs = [];
        if (intro !== N(o.text2 || "")) probs.push("text2(intro) mismatch");
        if (first !== N(o.text3 || "")) probs.push("text3(first section) mismatch");
        if (probs.length) report.articleDiffs.push({ index:i+1, id:o.id, title:o.title, problems:probs });
      }catch(e){
        report.articleDiffs.push({ index:i+1, id:o.id, title:o.title, error:e.message });
      }
    });
  }
  await q.onIdle();

  // ---- الصور المفقودة
  for (const o of data){
    if (o.img){
      const p = path.resolve(__dirname, "." + o.img);
      if (!fs.existsSync(p)) report.missingImages.push({ id:o.id, title:o.title, img:o.img });
    }
  }

  // ---- تجميع الملخص
  report.summary.categoryDiffs = report.categoryDiffs.length;
  report.summary.articleDiffs  = report.articleDiffs.length;
  report.summary.missingImages = report.missingImages.length;

  // اكتب التقرير
  fs.writeFileSync(
    path.resolve(__dirname,"verify-plumbing.report.json"),
    JSON.stringify(report,null,2),
    "utf8"
  );

  // ---- الطباعة في الكونسول
  console.log("Summary:", report.summary);

  if (report.duplicates.bySlug.length){
    console.log("Duplicate slugs:", report.duplicates.bySlug);
  }

  // فقط لو في تكرارات عناوين “حقيقية” (غير mirrored) نطبعها كتحذير
  if (report.duplicates.byTitle_real.length){
    console.log("Duplicate titles (need action):", report.duplicates.byTitle_real);
  } else {
    if (report.duplicates.byTitle_mirrors.length){
      console.log("Duplicate titles: OK (mirror of category):", report.duplicates.byTitle_mirrors);
    }
  }

  if (report.categoryDiffs.length){
    console.log("Category diffs (first 5):", report.categoryDiffs.slice(0,5));
  }
  if (report.articleDiffs.length){
    console.log("Article diffs (first 5):", report.articleDiffs.slice(0,5));
  }
  if (report.missingImages.length){
    console.log("Missing images (first 10):", report.missingImages.slice(0,10));
  }
})();
