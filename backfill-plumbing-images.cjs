/**
 * backfill-plumbing-images.cjs
 * يعيد تنزيل أي صور ناقصة المشار إليها داخل src/data/servicesPlumbingData.json
 * بالاعتماد على عناوين المقالات من صفحات الكاتيجوري، ثم أول صورة في صفحة المقال.
 * لا يغيّر سكربت البناء ولا بنية JSON.
 *
 * USAGE:
 *   npm i axios cheerio
 *   node backfill-plumbing-images.cjs
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://zahrat-khaleej.com/alkwait";
const CATEGORY = `${BASE}/category/%D9%81%D9%86%D9%8A-%D8%B5%D8%AD%D9%8A/`;
const MAX_PAGES = 11;

const DATA_JSON = path.resolve(__dirname, "src/data/servicesPlumbingData.json"); // ملفك الحالي
const IMG_DIR = path.resolve(__dirname, "public/image");                        // نفس مجلد الصور الأصلي

const UA = {
  "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language":"ar,en;q=0.9"
};

const norm = s => (s||"").normalize("NFKC").replace(/\u200e|\u200f/g,"").replace(/\s+/g," ").trim();

async function fetchHTML(url){
  const r = await axios.get(url, { headers: UA, timeout: 45000, validateStatus:s=>s<500 });
  return r.data;
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

async function buildTitleUrlMap(){
  const map = new Map();
  for (let p=1; p<=MAX_PAGES; p++){
    const url = p===1 ? CATEGORY : `${CATEGORY}page/${p}/`;
    try{
      const html = await fetchHTML(url);
      const $ = cheerio.load(html);
      $("h2 a, h3 a, .entry-title a").each((_, a)=>{
        const t = norm($(a).text());
        const href = $(a).attr("href") || "";
        if (t && href && !map.has(t)) map.set(t, href);
      });
    }catch(e){
      console.warn("⚠️ فشل جلب صفحة الكاتيجوري:", url, e.message);
    }
  }
  return map;
}

(async ()=>{
  if (!fs.existsSync(DATA_JSON)) {
    console.error("❌ لم يتم العثور على", DATA_JSON);
    process.exit(1);
  }
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

  const items = JSON.parse(fs.readFileSync(DATA_JSON, "utf8"));
  const titleUrl = await buildTitleUrlMap();

  let downloaded = 0, already = 0, notFound = 0;

  for (const it of items){
    const filename = path.basename(it.img || "");
    if (!filename){ notFound++; continue; }

    const dest = path.join(IMG_DIR, filename);
    if (fs.existsSync(dest)){ already++; continue; }

    const t = norm(it.title);
    const articleUrl = titleUrl.get(t);
    if (!articleUrl){
      console.warn("🔎 لم أجد مقالة للعنوان:", it.id, it.title);
      notFound++;
      continue;
    }

    try{
      const html = await fetchHTML(articleUrl);
      const $ = cheerio.load(html);
      const $content = $(".entry-content").first().length
        ? $(".entry-content").first()
        : $("article .entry, .post-content, .single-content").first();

      let imgUrl = firstImageFrom($content, $);
      if (!imgUrl){
        console.warn("🖼️ لا توجد صورة في المقال:", it.id, it.title);
        notFound++;
        continue;
      }

      // بعض السيرفرات تمنع التحميل بدون Referer حقيقي
      const res = await axios.get(imgUrl, {
        responseType: "arraybuffer",
        headers: { ...UA, Referer: articleUrl },
        timeout: 60000
      });

      fs.writeFileSync(dest, res.data);
      console.log("✅ Saved", filename);
      downloaded++;
    }catch(e){
      console.warn("⚠️ فشل تنزيل صورة:", it.id, it.title, "-", e.message);
      notFound++;
    }
  }

  console.log(`\nتم: downloaded=${downloaded}, موجود مسبقًا=${already}, لم يتم العثور/فشل=${notFound}`);
})();
