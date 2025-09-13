// src/pages/ServiceDetails.tsx
import { useParams, Navigate, Link } from "react-router-dom";
import { useMemo } from "react";
import "../styles/ServiceDetails.css";

import { BY_SLUG, servicesPlumbing, ServiceItem } from "../data/index";
import { toServicePath, fromServiceParam } from "../utils/slug";

import { ContentSection as DataContentSection } from "../data/index";

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

export default function ServiceDetails() {
  const { slug: routeParam } = useParams<{ slug: string }>();
  const decodedSlug = fromServiceParam(routeParam);

  const service = useMemo<DetailService | null>(() => {
    if (!decodedSlug) return null;
    return (BY_SLUG.get(decodedSlug) as DetailService) ?? null;
  }, [decodedSlug]);

  if (!decodedSlug) return <Navigate to="/404" replace />;
  if (!service) return <Navigate to="/404" replace />;

  return (
    <div className="service-details-page">
      <main className="service-details-container">
        <article className="service-details-content">
          <h1 className="service-details-title">{service.title}</h1>

          {service.img && (
            <div className="service-image-container">
              <img
                alt={service.title}
                src={service.img}
                className="service-details-image"
                loading="lazy"
              />
            </div>
          )}

          <div className="service-details-text">
            <div className="service-description">
              <p>{service.text2}</p>
              <p>{service.text3}</p>
            </div>

            {/* أقسام المحتوى الديناميكية من JSON */}
            {service.sections?.map((sec) => (
              <section key={sec.id} id={sec.id} className="content-section">
                {sec.heading && (
                  <h2 className="section-heading">{sec.heading}</h2>
                )}

                {sec.html ? (
                  <div
                    className="section-body"
                    dangerouslySetInnerHTML={{ __html: sec.html }}
                  />
                ) : (
                  <>
                    {sec.text && <p className="section-text">{sec.text}</p>}
                    {sec.img && (
                      <div className="section-image-container">
                        <img
                          alt={sec.heading || "صورة"}
                          src={sec.img}
                          className="section-image"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {sec.text3 && <p className="section-text">{sec.text3}</p>}
                    {sec.text4 && <p className="section-text">{sec.text4}</p>}
                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="section-bullets">
                        {sec.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {sec.question && <p className="section-question">{sec.question}</p>}
                    {sec.text2 && <p className="section-text">{sec.text2}</p>}
                  </>
                )}
              </section>
            ))}

            {/* خريطة من JSON (embedUrl أو link عادي) */}
            {service.map && (
              <section id="map" className="map-section">
                <h2 className="section-heading">
                  {service.map.title ?? "الموقع على الخريطة"}
                </h2>

                {service.map.embedUrl ? (
                  <div className="map-embed">
                    <iframe
                      src={service.map.embedUrl}
                      width="100%"
                      height="360"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={service.map.title ?? service.title}
                    />
                  </div>
                ) : service.map.link ? (
                  <p>
                    <a
                      className="map-link"
                      href={service.map.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      فتح الخريطة
                    </a>
                  </p>
                ) : null}
              </section>
            )}

            <div className="service-meta">
              <div className="service-id">رقم الخدمة: {service.id}</div>
              <div className="service-category">خدمات سباكة وصحية</div>
            </div>

            <div className="cta-buttons">
              <a href="tel:+96500000000" className="cta-button primary">
                اتصل بنا الآن
              </a>
              <a
                href="https://wa.me/96500000000"
                className="cta-button secondary"
                target="_blank"
                rel="noreferrer"
              >
                تواصل عبر واتساب
              </a>
            </div>
          </div>
        </article>

        <aside className="related-services">
          <h3>خدمات ذات صلة</h3>
          <div className="related-services-list">
            {servicesPlumbing.slice(0, 7).map((item) => (
              <Link
                key={item.urlSlug}
                to={toServicePath(item.urlSlug)}
                className="related-service-card"
              >
                {item.img && (
                  <img src={item.img} alt={item.title} loading="lazy" />
                )}
                <h4>{item.title}</h4>
                <span className="read-more">عرض التفاصيل</span>
              </Link>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
