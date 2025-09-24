import '../styles/Header.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>عن الموقع</h3>
          <p>نحن نقدم خدمات فنية وصحية متميزة في مختلف مناطق الكويت على مدار24 ساعة.</p>
        </div>
        
        <div className="footer-links">
          <h3>روابط مهمة</h3>
          <ul>
            <li><a href="">عن الشركة</a></li>
            <li><a href="">تواصل معنا</a></li>
          </ul>

        </div>
         <div className="footer-services">
          <h3>خدماتنا</h3>
          <ul>
            <li><a href="">سباكة صحية</a></li>
            <li><a href="">كشف تسريبات المياه</a></li>
            <li><a href="">تسليك المجاري</a></li>
            <li><a href="">تركيب سخانات</a></li>
            <li><a href="">صيانة مضخات المياه</a></li>
            <li><a href="">تجهيز المطابخ الصحية</a></li>
          </ul>
        </div>
        
        <div className="footer-social">
          <h3>تابعنا</h3>
          <div className="social-icons">
            <a href="#" aria-label="فيسبوك">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="تويتر">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                <path
                  d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" aria-label="إنستغرام">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="#" aria-label="واتساب">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        © 2025 جميع الحقوق محفوظة | موقع زهرة الكويت
      </div>
    </footer>
  );
};

export default Footer;