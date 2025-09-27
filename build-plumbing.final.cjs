/**
 * Build FINAL servicesPlumbingData.json with full schema:
 * { id:number, title, text, text2, text3, img, link:'/services/plumbing', slug, metaDescription,
 *   sections:[{id, heading, text, bullets?}], map:{title, link, embedUrl, lat, lng} }
 *
 * USAGE (from project root: the folder that has package.json):
 *   npm i axios cheerio p-queue
 *   # (no need for slugify; we use a custom Arabic slug)
 *   node build-plumbing.final.cjs
 *
 * OUTPUT:
 *   - servicesPlumbingData.final.json (in project root)
 *   - images saved into ./public/image/<arabic-slug>.<ext> (created if missing)
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

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
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

const norm = s => (s||"").normalize("NFKC").replace(/\u200e|\u200f/g,"").replace(/\s+/g," ").trim();
const arabicSlug = t => norm(t).replace(/[^\u0621-\u064A0-9\- ]+/g,"").replace(/\s+/g,"-");

async function fetchHTML(url){
  const res = await axios.get(url, { headers: HEADERS, timeout: 40000, decompress: true, validateStatus:s=>s<500 });
  return res.data;
}
function extractLinksFromHTML(html){
  const $ = cheerio.load(html);
  const links = [];
  $("a").each((_,a)=>{
    const href = $(a).attr("href");
    const title = norm($(a).text());
    if(href && title) links.push({title, url: href});
  });
  return links;
}

async function collectLinks(){
  const wanted = new Map(TITLES.map(t=>[norm(t), null]));
  for(let p=1;p<=MAX_PAGES;p++){
    const url = p===1 ? CATEGORY : `${CATEGORY}page/${p}/`;
    const html = await fetchHTML(url).catch(()=>null);
    if(!html) continue;
    const links = extractLinksFromHTML(html);
    for(const l of links){
      const tn = norm(l.title);
      if(wanted.has(tn) && !wanted.get(tn)) wanted.set(tn, l.url);
    }
  }
  // search fallback
  for(const [tn, u] of wanted){
    if(u) continue;
    const html = await fetchHTML(`${BASE}/?s=${encodeURIComponent(tn)}`).catch(()=>null);
    if(!html) continue;
    const links = extractLinksFromHTML(html);
    const hit = links.find(l=> norm(l.title)===tn) || links.find(l=> norm(l.title).includes(tn.split(" ")[0]));
    if(hit) wanted.set(tn, hit.url);
  }
  return wanted;
}

function firstImageFrom($root, $doc){
  // try content image first
  let src = $root.find("img").first().attr("data-src") || $root.find("img").first().attr("src") || "";
  if(!src){
    // og:image fallback
    const og = $doc("meta[property='og:image']").attr("content") || $doc("meta[name='twitter:image']").attr("content") || "";
    src = og || "";
  }
  if(src && src.startsWith("//")) src = "https:" + src;
  if(src && src.startsWith("/")) src = BASE + src;
  return src;
}

async function downloadImage(imgUrl, slug){
  const ext = path.extname(imgUrl.split("?")[0]) || ".jpg";
  const fname = `${slug}${ext}`;
  const full = path.join(IMG_DIR, fname);
  if (fs.existsSync(full)) return `/image/${fname}`; // reuse
  const res = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 60000, headers: HEADERS, decompress: true });
  fs.writeFileSync(full, res.data);
  return `/image/${fname}`;
}

function parseSections($content){
  const sections = [];
  let current = { id: "1", heading: "", text: "", bullets: [] };
  let counter = 1;

  const pushCurrent = () => {
    const obj = { id: String(counter), heading: current.heading || "", text: current.text.trim() };
    if (current.bullets.length) obj.bullets = current.bullets.slice(0, 50);
    if (obj.heading || obj.text) sections.push(obj);
    counter += 1;
    current = { id: String(counter), heading: "", text: "", bullets: [] };
  };

  $content.children().each((_, el)=>{
    const $el = cheerio.load(el, null, false).root();
    const tag = ($el.get(0)?.tagName || "").toLowerCase();
    if (["h1","h2","h3","h4"].includes(tag)){
      if (current.heading || current.text || current.bullets.length) pushCurrent();
      current.heading = norm($el.text());
    } else if (tag === "p"){
      const t = norm($el.text());
      if (t) current.text += (current.text ? "\n\n" : "") + t;
    } else if (tag === "ul" || tag === "ol"){
      $el.find("li").each((__, li)=>{
        const t = norm(cheerio(li).text());
        if (t) current.bullets.push(t);
      });
    } else {
      // ignore other tags but keep their text
      const t = norm($el.text());
      if (t) current.text += (current.text ? "\n\n" : "") + t;
    }
  });
  if (current.heading || current.text || current.bullets.length) pushCurrent();
  return sections.length ? sections : [{ id:"1", heading:"", text: norm($content.text()) }];
}

function summarize(s, n){
  const txt = norm(s || "");
  if (txt.length <= n) return txt;
  const cut = txt.lastIndexOf(" ", n);
  return (cut > 0 ? txt.slice(0, cut) : txt.slice(0, n)).trim() + "…";
}

(async () => {
  // 1) Resolve titles -> URLs
  const map = await collectLinks();
  const unresolved = [];
  TITLES.forEach(t => { if (!map.get(norm(t))) unresolved.push(t); });
  console.log("Resolved:", TITLES.length - unresolved.length, "/ 106");
  if (unresolved.length) console.log("Missing:", unresolved.slice(0,10));

  // 2) Fetch each post, build record
  const q = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });
  const results = [];
  for (let i=0; i<TITLES.length; i++){
    const title = TITLES[i];
    const id = i+1;
    const url = map.get(norm(title));
    if (!url){
      // fallback empty record to keep ordering
      results.push({ id, title, text:"", text2:"", text3:"", img:"", link:"/services/plumbing",
        slug: arabicSlug(title), metaDescription: "", sections:[{id:"1", heading:title, text:""}],
        map: {
          title: "زهرة الكويت – الكويت",
          link: "https://maps.google.com/?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar",
          embedUrl: "https://www.google.com/maps?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar&output=embed",
          lat: 29.34562843865095, lng: 47.38155420092979
        }
      });
      continue;
    }

    await q.add(async ()=>{
      try{
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        const content = $(".entry-content").first().length
          ? $(".entry-content").first()
          : $("article .entry, .post-content, .single-content").first();

        const sections = parseSections(content);
        const fullText = sections.map(s => s.heading ? (s.heading + " — " + s.text) : s.text).join("\n\n");
        const text = summarize(fullText || title, 180);
        const text2 = summarize(fullText || title, 1200);
        const text3 = sections[1]?.text ? summarize(sections[1].text, 900) : "";

        let imgUrl = firstImageFrom(content, $);
        let img = "";
        if (imgUrl) {
          try {
            img = await downloadImage(imgUrl, arabicSlug(title));
          } catch { img = ""; }
        }

        const metaDescription = summarize(fullText || title, 160);
        results.push({
          id,
          title,
          text,
          text2,
          text3,
          img,
          link: "/services/plumbing",
          slug: arabicSlug(title),
          metaDescription,
          sections,
          map: {
            title: "زهرة الكويت – الكويت",
            link: "https://maps.google.com/?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar",
            embedUrl: "https://www.google.com/maps?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar&output=embed",
            lat: 29.34562843865095,
            lng: 47.38155420092979
          }
        });
      }catch(e){
        console.warn("Fetch failed:", title, e.message);
        results.push({
          id, title, text:"", text2:"", text3:"", img:"", link:"/services/plumbing",
          slug: arabicSlug(title), metaDescription:"", sections:[{id:"1", heading:title, text:""}],
          map: {
            title: "زهرة الكويت – الكويت",
            link: "https://maps.google.com/?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar",
            embedUrl: "https://www.google.com/maps?q=%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA&hl=ar&output=embed",
            lat: 29.34562843865095, lng: 47.38155420092979
          }
        });
      }
    });
  }
  await q.onIdle();

  results.sort((a,b)=> a.id - b.id);
  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2), "utf8");
  console.log("✅ Saved:", OUT_JSON, "Items:", results.length);
})();
