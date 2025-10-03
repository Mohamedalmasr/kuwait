import { Link } from "react-router-dom";
import "../styles/Header.css";

const PHONE_DISPLAY = "+965 517 51604";
const PHONE_E164 = "+96551751604";
const PHONE_TEL = `tel:${PHONE_E164}`;
const FACEBOOK_URL = "https://www.facebook.com/share/1BZZavjSLF/";
const INSTAGRAM_URL = "https://www.instagram.com/bwmhmd16552?igsh=NnpxenRiY3FnamY4";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>سباك الكويت</h3>
          <p>
            نقدم خدمات سباكة وصيانة متكاملة في جميع مناطق الكويت على مدار الساعة
            مع فريق محترف وخبرة طويلة لضمان راحتكم.
          </p>
        </div>

        <div className="footer-links">
          <h3>روابط سريعة</h3>
          <ul>
            <li>
              <Link to="/">الرئيسية</Link>
            </li>
            <li>
              <Link to="/services">الخدمات</Link>
            </li>
            <li>
              <Link to="/contact">اتصل بنا</Link>
            </li>
            <li>
              <Link to="/search">بحث متقدم</Link>
            </li>
          </ul>
        </div>

        <div className="footer-services">
          <h3>خدماتنا</h3>
          <ul>
            <li>
              <Link to="/services/satellite">خدمات الستلايت</Link>
            </li>
            <li>
              <Link to="/services/plumbing">سباكة عامة</Link>
            </li>
            <li>
              <Link to="/services/plumber">فني سباكة منازل</Link>
            </li>
            <li>
              <Link to="/services/maintenance">صيانة شاملة</Link>
            </li>
            <li>
              <Link to="/services/drainage">تسليك مجاري</Link>
            </li>
            <li>
              <Link to="/services/installation">تركيب مضخات</Link>
            </li>
          </ul>
        </div>

        <div className="footer-social">
          <h3>تواصل معنا</h3>
          <ul className="footer-contact-list">
            <li>
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
            </li>
          </ul>

          <div className="social-icons">
            <a
              href={FACEBOOK_URL}
              aria-label="فيسبوك"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-facebook"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href={INSTAGRAM_URL}
              aria-label="إنستجرام"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; 2025 سباك الكويت | جميع الحقوق محفوظة
      </div>
    </footer>
  );
};

export default Footer;
