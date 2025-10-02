/**
 * fix-plumbing-titles.cjs
 * يجعل العناوين فريدة بإضافة " – نسخة N" على التكرارات بعد أول ظهور.
 */
const fs = require("fs");
const path = require("path");

const norm = s => (s||"")
  .normalize("NFKC")
  .replace(/\u200e|\u200f/g,"")
  .replace(/\s+/g," ")
  .trim();

// شيل أي لاحقة "– نسخة N" من آخر العنوان (عشان السكريبت يبقى idempotent)
function baseTitleOf(t){
  return norm(t).replace(/\s*[–-]\s*نسخة\s*\d+\s*$/,"").trim();
}

function loadData(){
  const A = path.resolve(__dirname, "src/data/servicesPlumbingData.json");
  const B = path.resolve(__dirname, "servicesPlumbingData.final.json");
  const p = fs.existsSync(A) ? A : (fs.existsSync(B) ? B : null);
  if (!p) throw new Error("لا يوجد ملف داتا.");
  return { path: p, data: JSON.parse(fs.readFileSync(p, "utf8")) };
}

(function main(){
  const { path: dataPath, data } = loadData();

  // ابنِ لائحة بالتكرارات حسب baseTitle
  const groups = new Map();
  for (const o of data){
    const base = baseTitleOf(o.title);
    if(!groups.has(base)) groups.set(base, []);
    groups.get(base).push(o);
  }

  // طبّق إعادة التسمية
  const changes = [];
  for (const [base, arr] of groups.entries()){
    if (arr.length <= 1) continue;
    // ثبّت أول واحد بالعنوان الأساسي، والباقي خليه "base – نسخة i"
    // بالترتيب الحالي (id أو الفهرس كما هو)
    arr.sort((a,b)=>a.id-b.id);
    for (let i=1; i<arr.length; i++){
      const before = arr[i].title;
      const after  = `${base} – نسخة ${i+1}`;
      if (before !== after){
        arr[i].title = after;
        changes.push({ id: arr[i].id, from: before, to: after });
      }
    }
  }

  if (!changes.length){
    console.log("لا توجد عناوين مكررة تحتاج تغيير. ✅");
    return;
  }

  // اكتب الملف
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ تم إصلاح ${changes.length} عنوان مكرر:`);
  console.table(changes.slice(0,10));
  if (changes.length > 10) console.log(`… و ${changes.length-10} أخرى`);
})();
