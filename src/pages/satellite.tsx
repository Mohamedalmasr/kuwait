import "../styles/satellite.css";
import SidebarWidgets from "./SidebarWidgets";

const Satellite = () => {
  return (
    <div className="rtl" dir="rtl">
      <section className="page-header">
        <div className="breadcrumb">الرئيسية / خدمة الستلايت</div>
        <h1>خدمة الستلايت</h1>
      </section>

      <div className="content-wrapper">
        {/* ✅ رسالة عدم وجود خدمات */}
        <main className="page-main">
          <section className="no-services-section">
            <div className="no-services-message">
              <h2>لا يوجد خدمات متاحة حالياً</h2>
              <p>نعتذر، لا توجد خدمات ستلايت متاحة في الوقت الحالي.</p>
              <p>يرجى المحاولة لاحقاً أو التواصل معنا للحصول على المزيد من المعلومات.</p>
            </div>
          </section>
        </main>

        {/* ✅ Sidebar */}
        <SidebarWidgets />
      </div>
    </div>
  );
};

export default Satellite;
