import { useRef, useState } from "react";
import type { IconType } from "react-icons";
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
} from "../data/services";

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

type QuickLink = {
  id: string;
  icon: IconType;
  title: string;
  hint: string;
  scrollTop?: boolean;
};

const QUICK_LINKS: QuickLink[] = [
  { id: "servicesPlumbing", icon: FaTools, title: "خدمات السباكة", hint: "حلول متكاملة للمنازل" },
  { id: "servicesPlumber", icon: FaWrench, title: "فني صحي متخصص", hint: "استجابة فورية للأعطال" },
  { id: "servicesDrainage", icon: FaWater, title: "تنظيف المجاري", hint: "معدات حديثة وآمنة" },
  { id: "servicesMaintenance", icon: FaToolbox, title: "صيانة عامة", hint: "زيارات دورية وجدولة مرنة" },
  { id: "servicesInstallation", icon: FaCogs, title: "التركيبات الصحية", hint: "تنفيذ كامل للمشاريع" },
  { id: "top", icon: FaStar, title: "العودة للأعلى", hint: "رجوع إلى بداية الصفحة", scrollTop: true },
];

const INITIAL_CONTENT = {
  video: "videos/main-video.mp4",
  title: "نصائح لاختيار الفني الصحي المناسب",
  shortText:
    "قبل طلب أي خدمة صحية في المنزل، تأكد من خبرة الفريق، واعرف خطوات العمل، وتكلفة الصيانة المتوقعة. في هذا المقطع نستعرض أهم النقاط التي يجب مراجعتها سريعاً.",
  fullText:
    "يُنصح دائماً بالتواصل مع فريق متخصص يقدم ضماناً على العمل، ويستخدم قطع غيار أصلية، ويشاركك خطة التنفيذ قبل البدء. كما ينبغي توثيق تفاصيل الزيارة والتأكد من تفعيل خدمة المتابعة بعد الإنجاز لضمان استمرارية الأداء الممتاز.",
};

const READ_MORE_LABEL = "عرض التفاصيل";
const HIDE_DETAILS_LABEL = "إخفاء التفاصيل";
const CARD_LINK_LABEL = "تفاصيل الخدمة";
const LOAD_MORE_SERVICES_LABEL = "عرض جميع الخدمات";
const IMAGE_ALT = "صورة الخدمة";

const categoryPaths = {
  plumbing: "/services/plumbing",
  plumber: "/services/plumber",
  drainage: "/services/drainage",
  maintenance: "/services/maintenance",
  installation: "/services/installation",
};

const Home = () => {
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [expandedArticles, setExpandedArticles] = useState<{ [key: number]: boolean }>({});
  const [currentContent, setCurrentContent] = useState(INITIAL_CONTENT);

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

  const [openedImage, setOpenedImage] = useState<string | null>(null);
  const closeImage = () => setOpenedImage(null);

  const toDetails = (item: ServiceItem, idx: number) =>
    generateServiceUrl({
      id: item.id ?? idx,
      title: item.title,
      slug: item.slug,
      urlSlug: item.urlSlug,
      link: item.link,
    });

  const goTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="home-page" dir="rtl">
      {openedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={openedImage} alt="صورة مكبرة" />
            <button className="close-btn" onClick={closeImage} aria-label="إغلاق">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <section className="section-links-grid" aria-label="التنقل السريع بين أقسام الخدمات">
        {QUICK_LINKS.map(({ id, icon: Icon, title, hint, scrollTop: shouldScrollTop }) => (
          <button
            key={id}
            className="section-card"
            onClick={() => (shouldScrollTop ? scrollTop() : goTo(id))}
          >
            <span className="icon">
              <Icon size={32} />
            </span>
            <span className="title">{title}</span>
            <span className="hint">{hint}</span>
          </button>
        ))}
      </section>

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
              {expandedArticles[0] ? HIDE_DETAILS_LABEL : READ_MORE_LABEL}
            </button>
          </div>
          <span className="badge green">{currentContent.title}</span>
        </div>

        <div className="side-articles">
          {videos.map((article, index) => (
            <div className="mini-article" key={index}>
              <button
                className="video-link"
                onClick={() => changeContent(article)}
                aria-label={`تشغيل الفيديو ${article.title}`}
              >
                <h3>{article.title}</h3>
              </button>
            </div>
          ))}
        </div>
      </section>

      <main>
        <section id="servicesPlumbing" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              خدمات السباكة <FaTools />
            </span>
          </h2>

          <div className="services">
            {visiblePlumbing.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || IMAGE_ALT}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  {CARD_LINK_LABEL}
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.plumbing}>
              {LOAD_MORE_SERVICES_LABEL}
            </NavLink>
          </div>
        </section>

        <section id="servicesPlumber" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              الفني الصحي <FaWrench />
            </span>
          </h2>

          <div className="services">
            {visiblePlumber.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || IMAGE_ALT}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  {CARD_LINK_LABEL}
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.plumber}>
              {LOAD_MORE_SERVICES_LABEL}
            </NavLink>
          </div>
        </section>

        <section id="servicesDrainage" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              تنظيف المجاري <FaWater />
            </span>
          </h2>

          <div className="services">
            {visibleDrainage.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || IMAGE_ALT}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  {CARD_LINK_LABEL}
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.drainage}>
              {LOAD_MORE_SERVICES_LABEL}
            </NavLink>
          </div>
        </section>

        <section id="servicesMaintenance" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              الصيانة العامة <FaToolbox />
            </span>
          </h2>

          <div className="services">
            {visibleMaintenance.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || IMAGE_ALT}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  {CARD_LINK_LABEL}
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.maintenance}>
              {LOAD_MORE_SERVICES_LABEL}
            </NavLink>
          </div>
        </section>

        <section id="servicesInstallation" className="services-section">
          <h2 className="section-title">
            <span className="icon">
              التركيبات الصحية <FaCogs />
            </span>
          </h2>

          <div className="services">
            {visibleInstallation.map((item, idx) => (
              <div className="service-card" key={item.id ?? item.urlSlug ?? item.slug ?? idx}>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title || IMAGE_ALT}
                    loading="lazy"
                    onClick={() => setOpenedImage(item.img!)}
                    style={{ cursor: "pointer" }}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to={toDetails(item, idx)} className="read-more">
                  {CARD_LINK_LABEL}
                </NavLink>
              </div>
            ))}
          </div>

          <div className="load-more-bar">
            <NavLink className="load-more" to={categoryPaths.installation}>
              {LOAD_MORE_SERVICES_LABEL}
            </NavLink>
          </div>
        </section>
      </main>

      <SidebarWidgets
        titleLatest="أحدث الخدمات المنشورة"
        titleCategories="تصنيفات الخدمات"
      />
    </div>
  );
};

export default Home;


