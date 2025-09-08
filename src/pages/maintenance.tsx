import { FaFileAlt, FaFolder, FaTimes } from "react-icons/fa";
import { useState } from "react";
import "../styles/maintenance.css";

type MaintenanceCardProps = {
  title: string;
  img: string;
  shortText: string;
  expandedText: string;
  onImageClick?: (src: string) => void;
};

const MaintenanceCard = ({
  title,
  img,
  shortText,
  expandedText,
  onImageClick,
}: MaintenanceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="maintenance-card">
      <div className="maintenance-card-image">
        <img
          src={img}
          alt={title}
          style={{ cursor: "pointer" }}
          onClick={() => onImageClick && onImageClick(img)}
        />
      </div>
      <div className="maintenance-card-content">
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

const Maintenance = () => {
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
        <div className="breadcrumb">الرئيسية / صيانة منزلية</div>
        <h1>صيانة منزلية</h1>
      </section>

      <div className="content-wrapper">
        {/* ✅ Articles */}
        <div className="maintenance-articles">
          <MaintenanceCard
            title="فني صيانة منازل الكويت"
            img="/image/img17.jpg"
            shortText="نقدم خدمات صيانة منزلية شاملة في جميع مناطق الكويت."
            expandedText="فريقنا متخصص في صيانة الكهرباء، السباكة، التكييف، وتركيب الأدوات المنزلية بأعلى جودة."
            onImageClick={setOpenedImage}
          />
          <MaintenanceCard
            title="خدمات تصليح فورية"
            img="/image/img18.jpg"
            shortText="خدمة تصليح فورية لجميع الأعطال المنزلية."
            expandedText="نصل إليك في أسرع وقت ونوفر قطع غيار أصلية وضمان على جميع أعمال الصيانة."
            onImageClick={setOpenedImage}
          />
          {/* أضف المزيد بنفس الطريقة مع نصوص وصور مختلفة */}
        </div>

        {/* ✅ Sidebar */}
        <div className="maintenance-sidebar">
          <div className="maintenance-sidebar-box">
            <div className="maintenance-sidebar-title">
              <FaFileAlt /> أحدث المقالات
            </div>
            <ul className="maintenance-sidebar-list">
              <li>
                <a href="#">أفضل فني صيانة منازل</a>
              </li>
              <li>
                <a href="#">خدمات تصليح التكييف</a>
              </li>
              <li>
                <a href="#">صيانة الكهرباء المنزلية</a>
              </li>
              <li>
                <a href="#">سباك صيانة منازل</a>
              </li>
              <li>
                <a href="#">تركيب أدوات منزلية</a>
              </li>
            </ul>
          </div>

          <div className="maintenance-sidebar-box">
            <div className="maintenance-sidebar-title">
              <FaFolder /> التصنيفات
            </div>
            <ul className="maintenance-sidebar-categories">
              <li>
                <a href="#">
                  صيانة منزلية <span>(20)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  كهرباء المنازل <span>(8)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  سباكة وصيانة <span>(15)</span>
                </a>
              </li>
              <li>
                <a href="#">
                  تكييف وصيانة <span>(5)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
