import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import { useState } from "react";
import "../styles/plumbing.css";

type PlumbingCardProps = {
  title: string;
  img: string;
  shortText: string;
  expandedText: string;
  onImageClick?: (src: string) => void;
};

const PlumbingCard = ({
  title,
  img,
  shortText,
  expandedText,
  onImageClick,
}: PlumbingCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="plumbing-card">
      <div className="plumbing-card-image">
        <img
          src={img}
          alt={title}
          style={{ cursor: "pointer" }}
          onClick={() => onImageClick && onImageClick(img)}
        />
      </div>
      <div className="plumbing-card-content">
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

const plumbing = () => {
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
        <div className="breadcrumb">الرئيسية / فني صحي الكويت</div>
        <h1>فني صحي الكويت</h1>
      </section>

      <div className="content-wrapper">
        {/* ✅ Articles */}
        <div className="plumbing-articles">
          <PlumbingCard
            title="مقاول صحي الكويت"
            img="/image/img13.jpg"
            shortText="مقاول صحي الكويت يقدم خدمات تركيب وصيانة الأدوات الصحية باحترافية عالية."
            expandedText="نستخدم أفضل المعدات ونوفر ضمان على جميع الأعمال الصحية في الكويت."
            onImageClick={setOpenedImage}
          />
          <PlumbingCard
            title="فني صحي الكويت"
            img="/image/img14.jpg"
            shortText="فني صحي الكويت متاح على مدار الساعة لجميع أعمال السباكة."
            expandedText="خدمة سريعة وأسعار مناسبة لجميع العملاء في مختلف المناطق."
            onImageClick={setOpenedImage}
          />
          {/* أضف المزيد بنفس الطريقة مع نصوص وصور مختلفة */}
        </div>

        {/* ✅ Sidebar */}
        <div className="plumbing-sidebar">
          <div className="plumbing-sidebar-box">
            <div className="plumbing-sidebar-title">
              <FaFileAlt /> أحدث المقالات
            </div>
            <ul className="plumbing-sidebar-list">
              <li>
                <a href="#">أفضل فني صحي الكويت</a>
              </li>
              <li>
                <a href="#">نصائح للحفاظ على الأدوات الصحية</a>
              </li>
              <li>
                <a href="#">أهمية الصيانة الدورية للسباكة</a>
              </li>
              <li>
                <a href="#">كيفية اختيار فني صحي محترف</a>
              </li>
            </ul>
          </div>

          <div className="plumbing-sidebar-box">
            <div className="plumbing-sidebar-title">
              <FaFolder /> تصنيفات
            </div>
            <ul className="plumbing-sidebar-list">
              <li>
                <a href="#">سباكة</a>
              </li>
              <li>
                <a href="#">أدوات صحية</a>
              </li>
              <li>
                <a href="#">صيانة</a>
              </li>
              <li>
                <a href="#">تركيب</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default plumbing;
