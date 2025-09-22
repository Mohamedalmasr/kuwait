import { useRef, useState } from "react";
import SidebarWidgets from "./SidebarWidgets";

import {
  FaTimes,
  FaTools,
  FaWater,
  FaWrench,
  FaToolbox,
  FaCogs,
  FaStar,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

import {
  servicesPlumbing,
  servicesPlumber,
  servicesDrainage,
  servicesMaintenance,
  servicesInstallation,
} from "../data";

import videos from "../data/videos";
import { generateServiceUrl } from "../utils/urls";
import "../styles/Home.css";

type ServiceItem = {
  id?: string | number;
  title: string;
  text: string;
  img?: string;
  link?: string;
  slug?: string;
  urlSlug?: string;
};

type VideoItem = {
  title: string;
  videoUrl: string;
  shortText: string;
  fullText: string;
};

const Home = () => {
  // ====== Counters (نعرض 5 في كل سكشن) ======
  const [visibleCountPlumbing] = useState(3);
  const [visibleCountPlumber] = useState(3);
  const [visibleCountDrainage] = useState(3);
  const [visibleCountMaintenance] = useState(3);
  const [visibleCountInstallation] = useState(3);

  const visiblePlumbing = (servicesPlumbing as ServiceItem[]).slice(0, visibleCountPlumbing);
  const visiblePlumber = (servicesPlumber as ServiceItem[]).slice(0, visibleCountPlumber);
  const visibleDrainage = (servicesDrainage as ServiceItem[]).slice(0, visibleCountDrainage);
  const visibleMaintenance = (servicesMaintenance as ServiceItem[]).slice(0, visibleCountMaintenance);
  const visibleInstallation = (servicesInstallation as ServiceItem[]).slice(0, visibleCountInstallation);

  // ====== فيديوهات ======
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expandedArticles, setExpandedArticles] = useState<{ [key: number]: boolean }>({});
  const [currentContent, setCurrentContent] = useState<{
    video: string;
    title: string;
    shortText: string;
    fullText: string;
  }>({
    video: "videos/main-video.mp4",
    title: "سباك الكويت",
    shortText:
      "سباك الكويت يعدّ من أفضل الفنيين في هذا المجال بالكويت، فنحن نقوم باستخدام أحدث...",
    fullText:
      'هنا النص الكامل الذي سيظهر عند الضغط على "أكمل القراءة". يمكنك وضع كل التفاصيل الإضافية هنا عن خدمات السباكة في الكويت والأسعار والمميزات وغير ذلك من المعلومات.',
  });

  const toggleReadMore = (index: number) => {
    setExpandedArticles((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const changeContent = (article: VideoItem) => {
    setCurrentContent({
      video: article.videoUrl,
      title: article.title,
      shortText: article.shortText,
      fullText: article.fullText,
    });
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((e) => console.error("Error playing video:", e));
    }
    setExpandedArticles({});
  };

  // ====== عرض الصورة في مودال ======
  const [openedImage, setOpenedImage] = useState<string | null>(null);
  const closeImage = () => setOpenedImage(null);

  // helper: يبني رابط التفاصيل بثبات
  const toDetails = (item: ServiceItem, idx: number) =>
    generateServiceUrl({
      id: item.id ?? idx, // fallback
      title: item.title,
      slug: item.slug,
      urlSlug: item.urlSlug,
      link: item.link,
    });

  // ====== روابط صفحات الفئات لزر "عرض المزيد" ======
  const categoryPaths = {
    plumbing: "/services/plumbing",
    plumber: "/services/plumber",
    drainage: "/services/drainage",
    maintenance: "/services/maintenance",
    installation: "/services/installation",
  };

  // ====== سكرول ناعم للسكاشن بدون # في الـURL ======
  const goTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="home-page" dir="rtl">
      {/* Image Modal */}
      {openedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={openedImage} alt="صورة مكبرة" />
            <button className="close-btn" onClick={closeImage} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* ✅ كروت روابط السكاشن (3 فوق + 3 تحت) — أصفر/ذهبي */}
      <section className="section-links-grid" aria-label="روابط سريعة للأقسام">
        <button className="section-card" onClick={() => goTo("servicesPlumbing")}>
          <span className="icon"><FaTools size={32} /></span>
          <span className="title">خدمات فني صحي</span>
          <span className="hint">انتقال للقسم</span>
        </button>

        <button className="section-card" onClick={() => goTo("servicesPlumber")}>
          <span className="icon"><FaWrench size={32} /></span>
          <span className="title">سباك الكويت</span>
          <span className="hint">انتقال للقسم</span>
        </button>

        <button className="section-card" onClick={() => goTo("servicesDrainage")}>
          <span className="icon"><FaWater size={32} /></span>
          <span className="title">تسليك المجاري</span>
          <span className="hint">انتقال للقسم</span>
        </button>

        <button className="section-card" onClick={() => goTo("servicesMaintenance")}>
          <span className="icon"><FaToolbox size={32} /></span>
          <span className="title">صيانة منزلية</span>
          <span className="hint">انتقال للقسم</span>
        </button>

        <button className="section-card" onClick={() => goTo("servicesInstallation")}>
          <span className="icon"><FaCogs size={32} /></span>
          <span className="title">تركيب أدوات صحية</span>
          <span className="hint">انتقال للقسم</span>
        </button>

        <button className="section-card" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="icon"><FaStar size={32} /></span>
          <span className="title">كل الخدمات</span>
          <span className="hint">إلى أعلى الصفحة</span>
        </button>
      </section>

      {/* ✅ مقالات الفيديو */}
      <section className="articles-grid">
        <div className="main-article">
          <video ref={videoRef} width="100%" controls>
            <source src={currentContent.video} type="video/mp4" />
          </video>

          <div className="main-content">
            <h2>{currentContent.title}</h2>
            <p>
              {currentContent.shortText}
              {expandedArticles[0] && (
                <>
                  <br />
                  <br />
                  {currentContent.fullText}
                </>
              )}
            </p>
            <button
              className="read-more green"
              onClick={() => toggleReadMore(0)}
              aria-expanded={!!expandedArticles[0]}
            >
              {expandedArticles[0] ? "قراءة الأقل «" : "أكمل القراءة »"}
            </button>
          </div>
          <span className="badge green">{currentContent.title}</span>
        </div>

        <div className="side-articles">
          {videos.map((article, index) => (
            <div className="mini-article" key={index}>
              <button className="video-link" onClick={() => changeContent(article)}>
                <h3>{article.title}</h3>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ الخدمات من data/services — كل سكشن يعرض 5 كروت فقط */}
      <main>
        {/* ====== خدمات فني صحي ====== */}
        <section id="servicesPlumbing" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              خدمات فني صحي <FaTools />
            </span>
          </h2>

          <div className="services">
            {visiblePlumbing.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.plumbing}>
              عرض المزيد
            </NavLink>
          </div>
        </section>

        {/* ====== سباك الكويت ====== */}
        <section id="servicesPlumber" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              سباك الكويت <FaWrench />
            </span>
          </h2>

          <div className="services">
            {visiblePlumber.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.plumber}>
              عرض المزيد
            </NavLink>
          </div>
        </section>

        {/* ====== تسليك المجاري ====== */}
        <section id="servicesDrainage" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              تسليك المجاري <FaWater />
            </span>
          </h2>

          <div className="services">
            {visibleDrainage.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.drainage}>
              عرض المزيد
            </NavLink>
          </div>
        </section>

        {/* ====== صيانة منزلية ====== */}
        <section id="servicesMaintenance" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              صيانة منزلية <FaToolbox />
            </span>
          </h2>

          <div className="services">
            {visibleMaintenance.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.maintenance}>
              عرض المزيد
            </NavLink>
          </div>
        </section>

        {/* ====== تركيب أدوات صحية ====== */}
        <section id="servicesInstallation" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              تركيب أدوات صحية <FaCogs />
            </span>
          </h2>

          <div className="services">
            {visibleInstallation.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.installation}>
              عرض المزيد
            </NavLink>
          </div>
        </section>
      </main>
        <SidebarWidgets />
      
    </div>
  );
};

export default Home;
