// src/pages/Plumbing.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes, FaTools, FaSpinner } from "react-icons/fa";

import "../styles/Home.css";
import "../styles/plumbing.css";

import { servicesPlumbing } from "../data/services";
import { generateServiceUrl } from "../utils/urls";
import { slugify } from "../utils/slug";
import SidebarWidgets from "./SidebarWidgets";

type ServiceItem = {
  id?: string | number;
  title: string;
  text: string;
  img?: string;
  link?: string;
  slug?: string;
  urlSlug?: string;
};

const PAGE_SIZE = 12;

const BREADCRUMB = "الرئيسية / فني صحي الكويت";
const PAGE_TITLE = "فني صحي الكويت";
const SECTION_TITLE = "خدمات فني صحي الكويت";
const READ_MORE = "اقرأ التفاصيل الآن";
const LOAD_MORE = "عرض المزيد من الخدمات";
const LOADING = "جارٍ التحميل...";
const IMAGE_ALT = "صورة الخدمة";

/* -------------------- إضافات بسيطة لمنع التكرار في الواجهة -------------------- */
/** توحيد النص العربي (إزالة محارف التوجيه والمسافات الزائدة) */
const norm = (s?: string) =>
  (s || "")
    .normalize("NFKC")
    .replace(/[\u200e\u200f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** فلترة العناصر مع الحفاظ على أول ظهور */
function uniqueBy<T>(arr: T[], getKey: (x: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = getKey(item) || "";
    if (k && seen.has(k)) continue;
    if (k) seen.add(k);
    out.push(item);
  }
  return out;
}

/** منع التكرار حسب (العنوان + المقتطف) أو العنوان فقط */
function uniqueCards(arr: ServiceItem[], mode: "title" | "title+text" = "title+text") {
  return uniqueBy(arr, (o) => {
    const t = norm(o.title);
    const txt = norm(o.text || "");
    return mode === "title" ? t : `${t}|${txt}`;
  });
}
/* --------------------------------------------------------------------------- */

const Plumbing = () => {
  const [openedImage, setOpenedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const closeImage = () => setOpenedImage(null);

  // كان: const items = ((servicesPlumbing as ServiceItem[]) || []);
  // الآن: ننقّي التكرارات في الواجهة فقط (لا نغير البيانات الأصلية)
  const rawItems = ((servicesPlumbing as ServiceItem[]) || []);
  const items = uniqueCards(rawItems, "title+text");

  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, items.length));
  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const toDetails = (item: ServiceItem, idx: number) => {
    const generatedSlug = item.urlSlug || item.slug || slugify(item.title, "preserve-arabic");

    return generateServiceUrl({
      id: item.id ?? idx,
      title: item.title,
      slug: generatedSlug,
      urlSlug: generatedSlug,
      link: item.link,
    });
  };

  const handleLoadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length));
      setLoading(false);
    }, 400);
  };

  return (
    <div className="rtl" dir="rtl">
      {openedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={openedImage} alt={IMAGE_ALT} />
            <button className="close-btn" onClick={closeImage} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <section className="page-header">
        <div className="breadcrumb">{BREADCRUMB}</div>
        <h1>{PAGE_TITLE}</h1>
      </section>

      <div className="content-wrapper">
        <main className="page-main">
          <section id="servicesPlumbing" className="services-section">
            <h2 className="section-title">
              <span className="icon">
                {SECTION_TITLE} <FaTools />
              </span>
            </h2>

            <div className="services">
              {visible.map((it, idx) => (
                <div
                  className="service-card"
                  // مفتاح أكثر تفرّدًا لتجنب تكرارات React DOM
                  key={`${it.id ?? idx}-${it.urlSlug ?? it.slug ?? slugify(it.title, "preserve-arabic")}`}
                >
                  {it.img && (
                    <img
                      src={it.img}
                      alt={it.title || IMAGE_ALT}
                      loading="lazy"
                      onClick={() => it.img && setOpenedImage(it.img)}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>

                  <NavLink to={toDetails(it, idx)} className="read-more">
                    {READ_MORE}
                  </NavLink>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="load-more-bar">
                <button
                  className="ig-load-more"
                  onClick={handleLoadMore}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spin" aria-hidden="true" />
                      {LOADING}
                    </>
                  ) : (
                    LOAD_MORE
                  )}
                </button>
              </div>
            )}
          </section>
        </main>

        <SidebarWidgets />
      </div>
    </div>
  );
};

export default Plumbing;
