import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import "../styles/satellite.css";
import { useState } from "react";

type SatelliteCardProps = {
  title: string;
  img: string;
  shortText: string;
  expandedText: string;
  onImageClick?: (src: string) => void;
};

const SatelliteCard = ({
  title,
  img,
  shortText,
  expandedText,
  onImageClick,
}: SatelliteCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="satellite-card">
      <div className="satellite-card-image">
        <img
          src={img}
          alt={title}
          style={{ cursor: "pointer" }}
          onClick={() => onImageClick && onImageClick(img)}
        />
      </div>
      <div className="satellite-card-content">
        <h3>{title}</h3>
        <p>
          {shortText}
          {expanded && <> {expandedText} </>}
        </p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "اقرأ أقل «" : "أكمل القراءة »"}
        </a>
      </div>
    </div>
  );
};

const Satellite = () => {
  const [openedImage, setOpenedImage] = useState<string | null>(null);

  const closeImage = () => setOpenedImage(null);

  return (
    <div className="rtl" dir="rtl">
      {/* ✅ نافذة الصورة المكبرة */}
      {openedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={openedImage} alt="صورة مكبرة" />
            <button className="close-btn" onClick={closeImage}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <section className="page-header">
        <div className="breadcrumb">الرئيسية / خدمة الستلايت</div>
        <h1>خدمة الستلايت</h1>
      </section>

      <div className="content-wrapper">
        <div className="satellite-articles">
          <SatelliteCard
            title="فني ستلايت الكويت"
            img="/image/img11.jpg"
            shortText="فني ستلايت الكويت يقدم أفضل خدمات تركيب وصيانة الستلايت."
            expandedText="نستخدم أحدث الأجهزة لضمان جودة الصورة وخدمة سريعة في جميع مناطق الكويت."
            onImageClick={setOpenedImage}
          />
          <SatelliteCard
            title="تركيب دش مركزي"
            img="/image/img12.jpg"
            shortText="خدمة تركيب دش مركزي بأفضل الأسعار."
            expandedText="نوفر لك جميع القطع الأصلية وضمان على التركيب والصيانة."
            onImageClick={setOpenedImage}
          />
        </div>

        <div className="satellite-sidebar">
          <div className="satellite-sidebar-box">
            <div className="satellite-sidebar-title">
              <FaFileAlt /> أحدث المقالات
            </div>
            <ul className="satellite-sidebar-list">
              <li>
                <a href="#">أفضل فني ستلايت الكويت</a>
              </li>
              <li>
                <a href="#">تركيب دش مركزي</a>
              </li>
              <li>
                <a href="#">صيانة أجهزة الستلايت</a>
              </li>
              <li>
                <a href="#">خدمات الستلايت السريعة</a>
              </li>
              <li>
                <a href="#">أسعار الستلايت في الكويت</a>
              </li>
            </ul>
          </div>

          <div className="satellite-sidebar-box">
            <div className="satellite-sidebar-title">
              <FaFolder /> التصنيفات
            </div>
            <ul className="satellite-sidebar-categories">
              <li>
                <a href="#">
                  ستلايت الكويت <span>(12)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  دش مركزي <span>(8)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  صيانة ستلايت <span>(15)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  أجهزة استقبال <span>(5)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Satellite;
