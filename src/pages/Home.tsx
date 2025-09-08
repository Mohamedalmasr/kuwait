// src/pages/Home.tsx
import { useRef, useState } from "react";
import { FaTimes, FaTools, FaWater } from "react-icons/fa";
import { Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  servicesPlumbing,
  servicesPlumber,
  servicesDrainage,
  servicesMaintenance,
  servicesInstallation,
} from "../data";

import videos from "../data/videos";
import cardsHome from "../data/CardHome";

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
  // ====== PLUMBING ======
  const [visibleCountPlumbing, setVisibleCountPlumbing] = useState(5);
  const visiblePlumbing = (servicesPlumbing as ServiceItem[]).slice(
    0,
    visibleCountPlumbing
  );
  const showMorePlumbing = () =>
    setVisibleCountPlumbing((c) => Math.min(c + 5, servicesPlumbing.length));
  const showLessPlumbing = () =>
    setVisibleCountPlumbing((c) => Math.max(c - 5, 5));

  // ====== PLUMBER ======
  const [visibleCountPlumber, setVisibleCountPlumber] = useState(5);
  const visiblePlumber = (servicesPlumber as ServiceItem[]).slice(
    0,
    visibleCountPlumber
  );
  const showMorePlumber = () =>
    setVisibleCountPlumber((c) => Math.min(c + 5, servicesPlumber.length));
  const showLessPlumber = () =>
    setVisibleCountPlumber((c) => Math.max(c - 5, 5));

  // ====== DRAINAGE ======
  const [visibleCountDrainage, setVisibleCountDrainage] = useState(5);
  const visibleDrainage = (servicesDrainage as ServiceItem[]).slice(
    0,
    visibleCountDrainage
  );
  const showMoreDrainage = () =>
    setVisibleCountDrainage((c) => Math.min(c + 5, servicesDrainage.length));
  const showLessDrainage = () =>
    setVisibleCountDrainage((c) => Math.max(c - 5, 5));

  // ====== MAINTENANCE ======
  const [visibleCountMaintenance, setVisibleCountMaintenance] = useState(5);
  const visibleMaintenance = (servicesMaintenance as ServiceItem[]).slice(
    0,
    visibleCountMaintenance
  );
  const showMoreMaintenance = () =>
    setVisibleCountMaintenance((c) =>
      Math.min(c + 5, servicesMaintenance.length)
    );
  const showLessMaintenance = () =>
    setVisibleCountMaintenance((c) => Math.max(c - 5, 5));

  // ====== INSTALLATION ======
  const [visibleCountInstallation, setVisibleCountInstallation] = useState(5);
  const visibleInstallation = (servicesInstallation as ServiceItem[]).slice(
    0,
    visibleCountInstallation
  );
  const showMoreInstallation = () =>
    setVisibleCountInstallation((c) =>
      Math.min(c + 5, servicesInstallation.length)
    );
  const showLessInstallation = () =>
    setVisibleCountInstallation((c) => Math.max(c - 5, 5));

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
    fullText: `هنا النص الكامل الذي سيظهر عند الضغط على "أكمل القراءة".
يمكنك وضع كل التفاصيل الإضافية هنا عن خدمات السباكة في الكويت والأسعار والمميزات وغير ذلك من المعلومات.`,
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
      id: item.id ?? idx,          // fallback لو مفيش id
      title: item.title,
      slug: item.slug,
      urlSlug: item.urlSlug,       // الأفضل لو موجود (من data/index.ts)
      link: item.link,             // لو هتستخدم preferCategoryLink في مكان آخر
    });

  return (
    <div className="home-page" dir="rtl">
      {/* Image Modal */}
      {openedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={openedImage} alt="صورة مكبرة" />
            <button className="close-btn" onClick={closeImage}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* الكروت من الملف */}
      <div className="cards-wrapper">
        <div className="slide active">
          {cardsHome.slice(0, 3).map((card) => (
            <div className="card" key={card.id}>
              <img
                src={card.img}
                alt={card.alt}
                onClick={() => setOpenedImage(card.img)}
                style={{ cursor: "pointer" }}
              />
              <div className="card-text">{card.title}</div>
              <p>{card.text}</p>
              {/* دي روابط ثابتة حسب بيانات الكروت */}
              <NavLink to={card.link} className="read-more">
                قراءة المزيد →
              </NavLink>
            </div>
          ))}
        </div>
      </div>

      <div className="cards-wrapper">
        <div className="slide active">
          {cardsHome.slice(3, 6).map((card) => (
            <div className="card" key={card.id}>
              <img
                src={card.img}
                alt={card.alt}
                onClick={() => setOpenedImage(card.img)}
                style={{ cursor: "pointer" }}
              />
              <div className="card-text">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <NavLink to={card.link} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مقالات الفيديو */}
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
            <a
              href="#"
              className="read-more green"
              onClick={(e) => {
                e.preventDefault();
                toggleReadMore(0);
              }}
            >
              {expandedArticles[0] ? "قراءة الأقل «" : "أكمل القراءة »"}
            </a>
          </div>
          <span className="badge green">{currentContent.title}</span>
        </div>

        <div className="side-articles">
          {videos.map((article, index) => (
            <div className="mini-article" key={index}>
              <div className="video-link" onClick={() => changeContent(article)}>
                <h3>{article.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* الخدمات من data/services */}
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
              <div className="service-card" key={item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    onClick={() => setOpenedImage(item.img!)}
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
            {visibleCountPlumbing < servicesPlumbing.length && (
              <button className="load-more" onClick={showMorePlumbing}>
                عرض المزيد
              </button>
            )}
            {visibleCountPlumbing > 5 && (
              <button className="load-more less" onClick={showLessPlumbing}>
                عرض أقل
              </button>
            )}
          </div>

          {visibleCountPlumbing >= servicesPlumbing.length &&
            servicesPlumbing.length > 0 && (
              <div className="all-shown-note">تم عرض جميع الشركات</div>
            )}
        </section>

        {/* ====== سباك الكويت ====== */}
        <section id="servicesPlumber" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              سباك الكويت <Wrench />
            </span>
          </h2>

          <div className="services">
            {visiblePlumber.map((item, idx) => (
              <div className="service-card" key={item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    onClick={() => setOpenedImage(item.img!)}
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
            {visibleCountPlumber < servicesPlumber.length && (
              <button className="load-more" onClick={showMorePlumber}>
                عرض المزيد
              </button>
            )}
            {visibleCountPlumber > 5 && (
              <button className="load-more less" onClick={showLessPlumber}>
                عرض أقل
              </button>
            )}
          </div>

          {visibleCountPlumber >= servicesPlumber.length &&
            servicesPlumber.length > 0 && (
              <div className="all-shown-note">تم عرض جميع الشركات</div>
            )}
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
              <div className="service-card" key={item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    onClick={() => setOpenedImage(item.img!)}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {/* ✅ كان قبلاً item.link — دلوقتي نستخدم generateServiceUrl لتفاصيل الخدمة */}
                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            {visibleCountDrainage < servicesDrainage.length && (
              <button className="load-more" onClick={showMoreDrainage}>
                عرض المزيد
              </button>
            )}
            {visibleCountDrainage > 5 && (
              <button className="load-more less" onClick={showLessDrainage}>
                عرض أقل
              </button>
            )}
          </div>

          {visibleCountDrainage >= servicesDrainage.length &&
            servicesDrainage.length > 0 && (
              <div className="all-shown-note">تم عرض جميع الشركات</div>
            )}
        </section>

        {/* ====== صيانة منزلية ====== */}
        <section id="servicesMaintenance" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              صيانة منزلية <FaTools />
            </span>
          </h2>

          <div className="services">
            {visibleMaintenance.map((item, idx) => (
              <div className="service-card" key={item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    onClick={() => setOpenedImage(item.img!)}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {/* كان item.link — دلوقتي تفاصيل */}
                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            {visibleCountMaintenance < servicesMaintenance.length && (
              <button className="load-more" onClick={showMoreMaintenance}>
                عرض المزيد
              </button>
            )}
            {visibleCountMaintenance > 5 && (
              <button className="load-more less" onClick={showLessMaintenance}>
                عرض أقل
              </button>
            )}
          </div>

          {visibleCountMaintenance >= servicesMaintenance.length &&
            servicesMaintenance.length > 0 && (
              <div className="all-shown-note">تم عرض جميع الشركات</div>
            )}
        </section>

        {/* ====== تركيب أدوات صحية ====== */}
        <section id="servicesInstallation" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              تركيب ادوات صحية <FaTools />
            </span>
          </h2>

          <div className="services">
            {visibleInstallation.map((item, idx) => (
              <div className="service-card" key={item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || "خدمة"}
                    onClick={() => setOpenedImage(item.img!)}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {/* كان item.link — دلوقتي تفاصيل */}
                <NavLink to={toDetails(item, idx)} className="read-more">
                  قراءة المزيد →
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            {visibleCountInstallation < servicesInstallation.length && (
              <button className="load-more" onClick={showMoreInstallation}>
                عرض المزيد
              </button>
            )}
            {visibleCountInstallation > 5 && (
              <button className="load-more less" onClick={showLessInstallation}>
                عرض أقل
              </button>
            )}
          </div>

          {visibleCountInstallation >= servicesInstallation.length &&
            servicesInstallation.length > 0 && (
              <div className="all-shown-note">تم عرض جميع الشركات</div>
            )}
        </section>
      </main>
    </div>
  );
};

export default Home;
