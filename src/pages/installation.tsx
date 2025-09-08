import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import { useState } from "react";
import "../styles/installation.css"; // CSS خاص بالتركيب

type InstallationCardProps = {
  title: string;
  img: string;
  shortText: string;
  expandedText: string;
  onImageClick?: (src: string) => void;
};

const InstallationCard = ({
  title,
  img,
  shortText,
  expandedText,
  onImageClick,
}: InstallationCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="installation-card">
      <div className="installation-card-image">
        <img
          src={img}
          alt={title}
          style={{ cursor: "pointer" }}
          onClick={() => onImageClick && onImageClick(img)}
        />
      </div>
      <div className="installation-card-content">
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

const installation = () => {
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
        <div className="breadcrumb">الرئيسية / فني تركيب أدوات صحية</div>
        <h1>فني تركيب أدوات صحية</h1>
      </section>

      <div className="content-wrapper">
        {/* ✅ Articles */}
        <div className="installation-articles">
          <InstallationCard
            title="فني تركيب أدوات صحية"
            img="/image/img21.jpg"
            shortText="فني تركيب أدوات صحية يقدم لك أفضل خدمات تركيب وصيانة الأدوات الصحية بدقة واحترافية،"
            expandedText="يستخدم أفضل الخامات والمعدات لضمان جودة التركيب وتجنب المشاكل المستقبلية في السباكة والصرف الصحي."
            onImageClick={setOpenedImage}
          />
          <InstallationCard
            title="تركيب مغاسل ومراحيض"
            img="/image/img22.jpg"
            shortText="نقوم بتركيب المغاسل والمراحيض بجودة عالية وضمان طويل المدى،"
            expandedText="نعتمد على أحدث الأدوات والتقنيات لتثبيت القطع الصحية بشكل آمن وبدون تسريب."
            onImageClick={setOpenedImage}
          />
        </div>

        {/* ✅ Sidebar */}
        <div className="installation-sidebar">
          <div className="installation-sidebar-box">
            <div className="installation-sidebar-title">
              <FaFileAlt /> أحدث المقالات
            </div>
            <ul className="installation-sidebar-list">
              <li>
                <a href="#">أفضل طرق تركيب مغاسل الحمام</a>
              </li>
              <li>
                <a href="#">تركيب خلاطات مياه إيطالية</a>
              </li>
              <li>
                <a href="#">فني تركيب مراحيض ذكية</a>
              </li>
              <li>
                <a href="#">تركيب حنفيات بدون لمس</a>
              </li>
              <li>
                <a href="#">أخطاء يجب تجنبها عند تركيب السخان</a>
              </li>
            </ul>
          </div>

          <div className="installation-sidebar-box">
            <div className="installation-sidebar-title">
              <FaFolder /> التصنيفات
            </div>
            <ul className="installation-sidebar-categories">
              <li>
                <a href="#">
                  Uncategorized <span>(1)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  فني صحي <span>(106)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  تركيب أدوات صحية <span>(18)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  سخانات المياه <span>(7)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  صيانة سباكة <span>(21)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default installation;
