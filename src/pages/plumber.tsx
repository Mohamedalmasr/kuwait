import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import { useState } from "react";
import "../styles/plumber.css";

type PlumberCardProps = {
  title: string;
  img: string;
  shortText: string;
  expandedText: string;
};

const PlumberCard = ({
  title,
  img,
  shortText,
  expandedText,
  onImageClick,
}: PlumberCardProps & { onImageClick?: (src: string) => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="plumber-card">
      <div className="plumber-card-image">
        <img
          src={img}
          alt={title}
          style={{ cursor: "pointer" }}
          onClick={() => onImageClick && onImageClick(img)}
        />
      </div>
      <div className="plumber-card-content">
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

const Plumber = () => {
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

      {/* ✅ Page Header */}
      <section className="page-header">
        <div className="breadcrumb">الرئيسية / سباك الكويت</div>
        <h1>سباك الكويت</h1>
      </section>

      <div className="content-wrapper">
        {/* ✅ Articles */}
        <div className="plumber-articles">
          <PlumberCard
            title="سباك الكويت"
            img="/image/img15.jpg"
            shortText="سباك الكويت يقدم خدمات تسليك وصيانة السباكة باحترافية عالية."
            expandedText="نستخدم أفضل المعدات ونوفر ضمان على جميع أعمال السباكة في الكويت."
            onImageClick={setOpenedImage}
          />
          <PlumberCard
            title="خدمات سباكة منزلية"
            img="/image/img16.jpg"
            shortText="خدمات سباكة منزلية متكاملة لجميع أنواع المنازل والشقق."
            expandedText="خدمة سريعة وأسعار مناسبة لجميع العملاء في مختلف المناطق."
            onImageClick={setOpenedImage}
          />
          {/* أضف المزيد بنفس الطريقة مع نصوص وصور مختلفة */}
        </div>

        {/* ✅ Sidebar */}
        <div className="plumber-sidebar">
          <div className="plumber-sidebar-box">
            <div className="plumber-sidebar-title">
              <FaFileAlt /> أحدث المقالات
            </div>
            <ul className="plumber-sidebar-list">
              <li>
                <a href="#">أفضل سباك الكويت</a>
              </li>
              <li>
                <a href="#">خدمات السباكة المنزلية</a>
              </li>
              <li>
                <a href="#">تسليك المجاري</a>
              </li>
              <li>
                <a href="#">صيانة الأدوات الصحية</a>
              </li>
              <li>
                <a href="#">أسعار السباكة في الكويت</a>
              </li>
            </ul>
          </div>

          <div className="plumber-sidebar-box">
            <div className="plumber-sidebar-title">
              <FaFolder /> التصنيفات
            </div>
            <ul className="plumber-sidebar-categories">
              <li>
                <a href="#">
                  سباك الكويت <span>(24)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  خدمات منزلية <span>(13)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  تسليك مجاري <span>(94)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  تركيب أدوات صحية <span>(4)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plumber;
