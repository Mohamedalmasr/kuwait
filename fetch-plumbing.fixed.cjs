/**
 * Usage (من جذر المشروع):
 *   npm i axios cheerio slugify p-queue
 *   node fetch-plumbing.fixed.cjs
 * الناتج:
 *   - servicesPlumbingData.106.fetched.json (في جذر المشروع)
 *   - الصور داخل public/image/
 * كل العناصر link='/services/plumbing'
 */
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const PQueue = require("p-queue").default;
const slugify = require("slugify");

const BASE = "https://zahrat-khaleej.com/alkwait";
const CATEGORY = `${BASE}/category/%D9%81%D9%86%D9%8A-%D8%B5%D8%AD%D9%8A/`;
const OUT_JSON = path.resolve(__dirname, "servicesPlumbingData.106.fetched.json");
const IMG_DIR = path.resolve(__dirname, "public/image");
const MAX_PAGES = 11;

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ar,en;q=0.9"
};

const TITLES = [
"فني صحي المهبولة","فني صحي جمعية هدية","فني صحي الدوحه","فني صحي جمعية سلوى","معلم صحى المنقف بالكويت",
"فني صحي جمعية سعد العبدالله","فني صحي جمعية مبارك الكبير","فني صحي جمعية عبد الله السالم","فني صحي جمعية حطين","فني صحي جمعية جليب الشيوخ",
"فني صحي جمعية جابر العلي","فني صحي جمعية جابر الأحمد","فني صحي جمعية ام الهيمان","فني صحي جمعية الوفرة","فني صحي جمعية الواحة",
"فني صحي جمعية النهضة","فني صحي جمعية بيان","فني صحي جمعية النسيم","افضل فني صحي لتركيب ادوات صحية في الكويت","فني صحي جمعية القصر",
"رقم فني صحي رخيص جنوب السرة","صحي الكويت","فني صحي جمعية العيون","فني صحي مبارك العالي","فني صحي جمعية فهد الأحمد",
"فني صحي جابر العالي","فني صحي قرطبه","فني صحي جمعية صباح السالم","فني صحي جمعية صباح الاحمد","فني صحي جمعية العبدلي",
"معلم صحي بالكويت","فني صحي سلوي","معلم صحي الكويت","فني صحي جنوب السرة","فني صحي وتسليك مجاري بالكويت",
"فني صحي جمعية العدان","فني صحي السره","فني صحي جمعية الفنطاس","فني صحي جمعية المنقف","فني صحي جمعية النزهة",
"فني صحي جمعية عبدالله المبارك","مقاول صحي الكويت","فنى صحى الكويت","فني صحي جمعية الفراونية","فني صحي جمعية العقيلة",
"فني صحي جمعية الشامية","فني صحي جمعية مبارك العبد الله","فني صحي جمعية صباح الناصر","فني صحي جمعية النعيم الجهراء","فني صحي جمعية الظهر",
"فني صحي جمعية الصليبية","فني صحي جمعية المنصورية","فني صحي جمعية العارضية","فني صحي جمعية الفحيحيل","فني صحي جمعية الشعب",
"فني صحي جمعية القرين","فني صحي جمعية الشهداء","فني صحي جمعية الزهراء","فني صحي جمعية العديلية","فني صحي جمعية الدسمة",
"فني صحي جمعية الروضة","فني صحي جمعية الصليبيخات","فني صحي جمعية الصباحية","فني صحي جمعية السرة","فني صحي جمعية الجهراء",
"فني صحي الفنطيس","فني صحي المنطقة العاشرة","فني صحي جمعية السالمية","فني صحي جمعية الشويخ","فني صحي مشرف",
"فني صحي جمعية السلام","فني صحي اقل سعر","فني صحي محترف تركيب ادوات صحيه","فني صحي لتركيب ادوات صحية في الكويت","معلم صحي مبارك الكبير",
"فني صحي جمعية الرابية","فني صحي جمعية الدوحة","فني صحي جمعية القيروان","فني صحي جمعية اشبيلية","فني صحي جمعية الفيحاء",
"فني صحي جمعية القادسية","فني صحي جمعية الرحاب","فني صحي جمعية الأحمدي","فني صحي جمعية الأندلس","فني صحي جمعية الجابرية",
"فني صحي جمعية الرميثية","فني صحي جمعية القصور","فني صحي جمعية الدعية","فني صحي جمعية الرقة","فني صحي جمعية ابو حليفة",
"فني صحي جمعية الخالدية","فني صحي المسايل","معلم صحي الشامية","فني صحي حولي الكويت","فني صحي الصديق",
"فني صحي جمعية اليرموك","فني صحي غرناطة","فني صحي الصليبخات","فني صحي مشرف","فني صحي ابو فطيرة",
"معلم ادوات صحية","فني صحي جمعية قرطبة","فني صحي جمعية خيطان","فني صحي جمعية كيفان","فني صحي جمعية حولي","فني صحي جمعية الفردوس"
];

const NORM = s => (s||"").normalize("NFKC").replace(/\u200e|\u200f/g,"").replace(/\s+/g," ").trim();

async function fetchText(url){ return axios.get(url, { headers: UA, timeout: 40000, decompress: true }).then(r=>r.data); }

function extractLinksFromHTML(html){
  const $ = cheerio.load(html);
  const anchors = $("a");
  const links = [];
  anchors.each((_,a)=>{
    const href = $(a).attr("href");
    const t = NORM($(a).text());
    if (href && t) links.push({ title:t, url:href });
  });
  return links;
}

async function collectByCategoryPages(){
  const wanted = new Map(TITLES.map(t=>[NORM(t), null]));
  for(let p=1;p<=MAX_PAGES;p++){
    const url = p===1 ? CATEGORY : `${CATEGORY}page/${p}/`;
    const html = await fetchText(url).catch(()=>null);
    if(!html) continue;
    const links = extractLinksFromHTML(html);
    for(const l of links){
      const norm = NORM(l.title);
      if(wanted.has(norm) && !wanted.get(norm)){
        wanted.set(norm, l.url);
      }
    }
  }
  return wanted;
}

async function trySearchFallback(wantedMap){
  // لأي عنوان لسه ملوش URL: جرّب صفحة البحث ?s=
  for(const [titleNorm, url] of wantedMap){
    if(url) continue;
    const q = encodeURIComponent(titleNorm);
    const html = await fetchText(`${BASE}/?s=${q}`).catch(()=>null);
    if(!html) continue;
    const links = extractLinksFromHTML(html);
    // اختار أول لينك عنوانه يطابق جزئيًا
    const hit = links.find(l => NORM(l.title) === titleNorm) ||
                links.find(l => NORM(l.title).includes(titleNorm.split(" ")[0]));
    if(hit) wantedMap.set(titleNorm, hit.url);
  }
  return wantedMap;
}

function firstImgSrcFrom($root){
  let src = $root.find("img").first().attr("data-src") || $root.find("img").first().attr("src") || "";
  if (src && src.startsWith("//")) src = "https:" + src;
  if (src && src.startsWith("/")) src = BASE + src;
  return src;
}

async function downloadImage(url, filename){
  const out = path.join(IMG_DIR, filename);
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000, headers: UA });
  fs.writeFileSync(out, res.data);
  return `/image/${filename}`;
}

async function fetchPost(url){
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const content = $(".entry-content").first().length
    ? $(".entry-content").first()
    : $("article .entry, .post-content, .single-content").first();
  const text = content.text().replace(/\s+/g," ").trim();
  let imgSrc = firstImgSrcFrom(content);
  let imgPath = "";
  if (imgSrc){
    const ext = path.extname(imgSrc.split("?")[0]) || ".jpg";
    const fname = slugify(url.split("/").filter(Boolean).pop() || String(Date.now()), {lower:true, strict:true}) + ext;
    try { imgPath = await downloadImage(imgSrc, fname); } catch {}
  }
  return { text, img: imgPath };
}

(async()=>{
  // 1) لمّ اللينكات من صفحات التصنيف
  let map = await collectByCategoryPages();

  // 2) لو ناقص، جرّب البحث الداخلي
  map = await trySearchFallback(map);

  // 3) كوّن مصفوفة نهائية بالترتيب الأصلي للـ106 عنوان
  const resolved = [];
  const missing = [];
  TITLES.forEach((t, i)=>{
    const url = map.get(NORM(t));
    if(url) resolved.push({ id:String(i+1), title:t, url });
    else missing.push(t);
  });

  console.log("Resolved:", resolved.length, "/ 106");
  if (missing.length){
    console.log("Missing titles:", missing.length, "مثال:", missing.slice(0,5));
  }

  // 4) هات النص + الصورة لكل عنوان محلول
  const q = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });
  const out = [];
  for (const r of resolved){
    await q.add(async ()=>{
      console.log("Fetching:", r.title);
      const { text, img } = await fetchPost(r.url);
      out.push({
        id: r.id,
        img: img || "",
        title: r.title,
        text: text || "",
        link: "/services/plumbing"
      });
    });
  }
  await q.onIdle();

  // 5) احفظ الناتج
  out.sort((a,b)=> Number(a.id)-Number(b.id));
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf8");
  console.log("✅ Saved:", OUT_JSON, "Items:", out.length);
})();
