// src/pages/ServiceDetails.tsx
import { useParams, Navigate, Link } from "react-router-dom";
import { useMemo } from "react";
import "../styles/ServiceDetails.css";

import { BY_SLUG, servicesPlumbing, ServiceItem } from "../data/services";
import { toServicePath, fromServiceParam } from "../utils/slug";
import SidebarWidgets from "../pages/SidebarWidgets"; // ✅ رجّعناه
import { ContentSection as DataContentSection } from "../data/services";
import { FiPhone, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

type ContentSection = DataContentSection & {
  text2?: string;
  text3?: string;
  text4?: string;
  question?: string;
  img?: string;
};

type MapInfo = {
  title?: string;
  link?: string;
  embedUrl?: string;
  lat?: number;
  lng?: number;
};

type DetailService = ServiceItem & {
  sections?: ContentSection[];
  map?: MapInfo;
};

const DEFAULT_MAP_TITLE = "موقع الخدمة على الخريطة";
const DEFAULT_QUESTION_HEADING = "هل لديك سؤال إضافي؟";
const RELATED_SERVICES_TITLE = "قد يعجبك أيضًا";
const VIEW_DETAILS_LABEL = "عرض التفاصيل";
const SERVICE_CATEGORY_LABEL = "التصنيف";
const SERVICE_ID_LABEL = "رقم الخدمة";
const MAP_LINK_LABEL = "عرض الموقع في نافذة جديدة";

export default function ServiceDetails() {
  const { slug: routeParam } = useParams<{ slug: string }>();
  const decodedSlug = fromServiceParam(routeParam);

  const service = useMemo<DetailService | null>(() => {
    if (!decodedSlug) return null;
    return (BY_SLUG.get(decodedSlug) as DetailService) ?? null;
  }, [decodedSlug]);

  if (!decodedSlug) return <Navigate to="/404" replace />;
  if (!service) return <Navigate to="/404" replace />;

  const hasMap =
    !!service.map && (!!service.map.embedUrl || !!service.map.link);

  return (
    <div className="sd-page">
      <main className="sd-container">
        {/* Breadcrumb */}
        <nav className="sd-breadcrumb" aria-label="breadcrumb">
          <Link to="/">الرئيسية</Link>
          <span className="sep">/</span>
          <span aria-current="page">{service.title}</span>
        </nav>

        <article className="sd-article">
          {/* Hero */}
          {service.img && (
            <div className="sd-hero">
              <img
                src={service.img}
                alt={service.title}
                loading="lazy"
                className="sd-hero-img"
              />
            </div>
          )}

          <h1 className="sd-title">{service.title}</h1>

          {/* Meta chips */}
          <div className="sd-meta">
            <span className="chip ghost">
              {SERVICE_ID_LABEL}: <b>{service.id}</b>
            </span>
            <span className="chip brand">
              {SERVICE_CATEGORY_LABEL}: <b>{service.link || "عام"}</b>
            </span>
          </div>

          {/* Intro */}
          {(service.text2 || service.text3) && (
            <div className="sd-intro">
              {service.text2 && <p>{service.text2}</p>}
              {service.text3 && <p>{service.text3}</p>}
            </div>
          )}

          {/* Sections */}
          {service.sections?.map((sec) => (
            <section key={sec.id} id={sec.id} className="sd-section">
              {sec.heading && (
                <h2 className="sd-section-title">{sec.heading}</h2>
              )}

              {sec.html ? (
                <div
                  className="sd-section-body"
                  dangerouslySetInnerHTML={{ __html: sec.html }}
                />
              ) : (
                <>
                  {sec.text && <p className="sd-p">{sec.text}</p>}
                  {sec.img && (
                    <div className="sd-section-media">
                      <img
                        alt={sec.heading || "صورة مرفقة"}
                        src={sec.img}
                        loading="lazy"
                      />
                    </div>
                  )}
                  {sec.text3 && <p className="sd-p">{sec.text3}</p>}
                  {sec.text4 && <p className="sd-p">{sec.text4}</p>}
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="sd-ul">
                      {sec.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {sec.question && (
                    <p className="sd-question">
                      {sec.question || DEFAULT_QUESTION_HEADING}
                    </p>
                  )}
                  {sec.text2 && <p className="sd-p">{sec.text2}</p>}
                </>
              )}
            </section>
          ))}

          {/* Map — مفتوحة افتراضيًا + ارتفاع احتياطي للـiframe */}
          {hasMap && (
            <details className="sd-fold" open>
              <summary className="sd-fold-summary">
                {service.map!.title ?? DEFAULT_MAP_TITLE}
              </summary>

              <div className="sd-map">
                {service.map!.embedUrl ? (
                  <iframe
                    src={service.map!.embedUrl}
                    title={service.map!.title ?? service.title}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    style={{ width: "100%", height: 360, border: 0 }} // ✅ fallback ارتفاع
                  />
                ) : (
                  <p>
                    <a
                      className="sd-map-link"
                      href={service.map!.link!}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {MAP_LINK_LABEL}
                    </a>
                  </p>
                )}
              </div>
            </details>
          )}

          {/* CTAs — أيقونات من react-icons */}
          <div className="sd-ctas iconbar">
            {/* اتصال */}
            <a
              href="tel:+96551751604"
              className="btn icon primary"
              title="اتصال هاتفي"
              aria-label="اتصال هاتفي"
            >
              <FiPhone className="ico" />
              <span className="sr-only">اتصال</span>
            </a>

            {/* واتساب */}
            <a
              href="https://wa.me/96551751604"
              className="btn icon accent"
              target="_blank"
              rel="noreferrer"
              title="واتساب"
              aria-label="واتساب"
            >
              <FaWhatsapp className="ico" />
              <span className="sr-only">واتساب</span>
            </a>

            {/* تواصل معنا — يذهب لصفحة /contact داخل الموقع */}
            <Link
              to="/contact"
              className="btn icon ghost"
              title="تواصل معنا"
              aria-label="تواصل معنا"
            >
              <FiMail className="ico" />
              <span className="sr-only">تواصل معنا</span>
            </Link>
          </div>
        </article>

        {/* Related في الأسفل */}
        <section className="sd-related" aria-labelledby="sd-related-title">
          <h3 id="sd-related-title" className="sd-related-title">
            {RELATED_SERVICES_TITLE}
          </h3>
          <div className="sd-related-list">
            {servicesPlumbing.slice(0, 8).map((item) => (
              <Link
                key={item.urlSlug}
                to={toServicePath(item.urlSlug)}
                className="sd-card"
              >
                {item.img && (
                  <img src={item.img} alt={item.title} loading="lazy" />
                )}
                <div className="sd-card-body">
                  <h4 className="sd-card-title">{item.title}</h4>
                  <span className="sd-card-link">{VIEW_DETAILS_LABEL}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ✅ Widgets تحت سيكشن "قد يعجبك أيضًا" */}
        <section className="sd-widgets" aria-label="widgets">
          <SidebarWidgets
            titleLatest="أحدث الخدمات المنشورة"
            titleCategories="تصنيفات الخدمات"
          />
        </section>
      </main>
    </div>
  );
}

