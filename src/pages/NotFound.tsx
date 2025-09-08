import { Link } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-page">

      <main className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-number">404</div>
          <h1 className="not-found-title">الصفحة غير موجودة</h1>
          <p className="not-found-message">
            عذراً، الصفحة التي تبحث عنها غير موجودة. قد تكون تم نقلها أو حذفها.
          </p>

          <div className="not-found-actions">
            <Link to="/" className="not-found-button primary">
              العودة إلى الصفحة الرئيسية
            </Link>
            <Link to="/services" className="not-found-button secondary">
              تصفح الخدمات
            </Link>
          </div>

          <div className="not-found-search">
            <h3>ابحث عن الخدمة التي تريدها:</h3>
            <div className="search-suggestions">
              <Link to="/services/plumbing">خدمات السباكة</Link>
              <Link to="/services/plumber">سباك الكويت</Link>
              <Link to="/services/drainage">تسليك المجاري</Link>
              <Link to="/services/maintenance">الصيانة المنزلية</Link>
              <Link to="/services/installation">خدمات التركيب</Link>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default NotFound;
