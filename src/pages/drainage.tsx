import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import { useState } from "react";
import "../styles/drainage.css";

type DrainageCardProps = {
  title: string;
  img: string;
  shortText: string;
  expandedText: string;
  onImageClick?: (src: string) => void;
};

const DrainageCard = ({
  title,
  img,
  shortText,
  expandedText,
  onImageClick,
}: DrainageCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="drainage-card">
      <div className="drainage-card-image">
        <img
          src={img}
          alt={title}
          style={{ cursor: "pointer" }}
          onClick={() => onImageClick && onImageClick(img)}
        />
      </div>
      <div className="drainage-card-content">
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

const drainage = () => {
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
        <div className="breadcrumb">الرئيسية / فني تسليك مجاري</div>
        <h1>فني تسليك مجاري</h1>
      </section>

      <div className="content-wrapper">
        {/* ✅ Articles */}
        <div className="drainage-articles">
          <DrainageCard
            title="فني تسليك مجاري الكويت"
            img="/image/img19.jpg"
            shortText="فني تسليك مجاري الكويت يوفر لك حلولاً فعالة وسريعة لمشاكل المجاري والصرف الصحي،"
            expandedText="يستخدم أحدث المعدات لضمان تسليك المجاري بأمان وبدون أي أضرار للمكان."
            onImageClick={setOpenedImage}
          />
          <DrainageCard
            title="فني تسليك مجاري الكويت"
            img="/image/img20.jpg"
            shortText="فني تسليك مجاري الكويت يوفر لك حلولاً فعالة وسريعة لمشاكل المجاري والصرف الصحي،"
            expandedText="يستخدم أحدث المعدات لضمان تسليك المجاري بأمان وبدون أي أضرار للمكان."
            onImageClick={setOpenedImage}
          />

          {/* أضف المزيد بنفس الطريقة مع نصوص وصور مختلفة */}
        </div>

        {/* ✅ Sidebar */}
        <div className="drainage-sidebar">
          <div className="drainage-sidebar-box">
            <div className="drainage-sidebar-title">
              <FaFileAlt /> أحدث المقالات
            </div>
            <ul className="drainage-sidebar-list">
              <li>
                <a href="#">شركة تسليك مجاري الضجيج</a>
              </li>
              <li>
                <a href="#">شركة تسليك مجاري الصالحية</a>
              </li>
              <li>
                <a href="#">شركة تسليك مجاري الشرق</a>
              </li>
              <li>
                <a href="#">شركة تسليك مجاري الشدادية</a>
              </li>
              <li>
                <a href="#">شركة تسليك مجاري الزهراء</a>
              </li>
            </ul>
          </div>

          <div className="drainage-sidebar-box">
            <div className="drainage-sidebar-title">
              <FaFolder /> التصنيفات
            </div>
            <ul className="drainage-sidebar-categories">
              <li>
                <a href="#">
                  Uncategorized <span>(1)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  سباك الكويت <span>(24)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  صيانة وخدمات منزلية <span>(13)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  فني تسليك مجاري <span>(94)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  فني تركيب ادوات صحية <span>(4)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  فني صحي <span>(106)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default drainage;
