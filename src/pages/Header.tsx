import { FaWhatsapp, FaArrowUp } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Header.css";

import SearchGlobal from "./SearchGlobal"; // ← الكومبوننت الجديد

const Header = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const arabicDate = today.toLocaleDateString("ar-KW", options);

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <header className="header">
        <div className="date">{arabicDate}</div>
        <nav className="main-nav">
          <NavLink to="/" end>عن الشركة</NavLink>
          <NavLink to="/contact">اتصل بنا</NavLink>
        </nav>
      </header>

      <section className="logo-section">
        <img src="/image/spak.jpg" alt="في صحي الكويت" />
      </section>

      <nav className="menu">
        <NavLink to="/home" end>الرئيسية</NavLink>
        <NavLink to="/services/satellite">خدمة الستلايت</NavLink>
        <NavLink to="/services/plumbing">فني صحي</NavLink>
        <NavLink to="/services/plumber">سباك الكويت</NavLink>
        <NavLink to="/services/maintenance">صيانة منزلية</NavLink>
        <NavLink to="/services/drainage">فني تسليك مجاري</NavLink>
        <NavLink to="/services/installation">تركيب أدوات صحية</NavLink>
      </nav>

      {/* ✅ البحث المنفصل – هيظهر تحت المنيو في كل الصفحات */}
      <SearchGlobal />

      {/* واتساب */}
      <a href="https://wa.me/01158936998" className="whatsapp" title="تواصل عبر واتساب">
        <FaWhatsapp />
      </a>

      {/* زر الصعود لأعلى */}
      <button
        className={`scroll-top ${showScroll ? "show" : ""}`}
        onClick={scrollTop}
        title="الرجوع لأعلى"
        aria-hidden={!showScroll}
        tabIndex={showScroll ? 0 : -1}
      >
        <FaArrowUp />
      </button>
    </>
  );
};

export default Header;
