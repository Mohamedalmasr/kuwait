import "leaflet/dist/leaflet.css";
import "../styles/Header.css"; // Assuming you have a CSS file for styles

const MainComponent = () => {
  return (
    <div dir="rtl">
      {/* ✅ SECTION: Cards */}
      <div className="card_MainComponent">
        <h1>زهرة الكويت</h1>
        <p>
          عن الشركة زهرة الكويت شركة كويتية واعدة تقدم أفضل خدمات النظافة العامة
          ونقل الأثاث من وإلى كل محافظات الكويت مع توفير أفضل المبيدات الحشرية
          لمحاربة الحشرات بكل أشكالها، شركة زهرة الكويت توفر أفضل المهندسين
          المسئولين عن صيانة لكافة أنواع الأجهزة مثل التكيفات والرسيفر وتركيب
          وصيانة الستلايت وغيرها من الخدمات …
        </p>
      </div>
      <div className="card_MainComponent_h1">
        <h1>عن الشركة زهرة الكويت والخدمات التي تقدمها :-</h1>
      </div>
      <div className="card_MainComponent_bloge">
        <h1> التنظيف بالكويت :</h1>
        <p>
          تعمل شركة زهرة الكويت لتوفير عمالة تساعدك في تنظيف المنازل والفلل
          والشقق المفروشة والمستأجرة ، كما نقوم بتوفير عمالة بأعداد كبيرة بأجهزة
          بخار ومنظفات عالية الجودة لتنظيف السجاد والكنب والمدارس والمساجد
          والمولات{" "}
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1>مكافحة الحشرات بالكويت :</h1>
        <p>
          توفر شركة زهرة الكويت خدمات إبادة الحشرات مهما كانت أعدادها وأنوعها
          لدينا فرق رش مبيدات للقضاء على النمل والجرذان والبعوض وكافة الحشرات
          المنزلية وحشرات المزارع والمسطحات الخضراء، وتركيب طارد الحمام للحفاظ
          على منزلك من كل المنغصات والأوبئة.{" "}
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1> نقل العفش بالكويت :</h1>
        <p>
          تحرص شركة زهرة الكويت على توفير سيارات وعمالة مدربة لنقل العفش عبر كل
          المدن الكويتية بسعر مناسب في أقل وقت بدون إحداث أضرار للممتلكات
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1> بنشر متنقل بالكويت :</h1>
        <p>
          نوفر عمال صيانة سريعة على الطرق ليكونوا على جاهزية تامة لتصليح
          السيارات ودعمها بالوقود وقطع الغيار اللازمة.
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1>فني صحي بالكويت :</h1>
        <p>
          توفير أفضل سباك بالكويت لأعمال صيانة السباكة المنزلية وتركيب مواسير
          الصرف الصحي والأحواض وتشطيب سباكة المنازل والمنشآت الحديثة وتصليح
          الأعطال وتسليك المجاري بأقل الأسعار
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1> قني ستلايت بالكويت :</h1>
        <p>
          نقدم في شركة زهرة الكويت أفضل فني ستلايت لتركيب الدش وتصليح الرسيفر
          وتنظيم قنوات التلفاز وتصليح أعطال ضعف الإشارة وتحميل أحدث الترددات
          والاشتراك في قنوات بن سبورت .
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1> فني صيانة تكيف مركزي بالكويت :</h1>
        <p>
          لصيانة وتنظيف التكيفات المركزية والتكيفات الاسبليت والشباك مع توفير
          قطع الغيار الأصلية .
        </p>
      </div>

      <div className="card_MainComponent_bloge">
        <h1> كما نوفر لكم بعض الخدمات المميزة مثل :-</h1>
        <p>
          فني كهربائي لصيانة وتصليح الأعطال الكهربائية وتركيب وصلات الكهرباء
          بأفضل الوصلات والاكسسوارات الكهربية ووحدات الإضاءة الحديثة وتصليح
          كهرباء السيارات بمختلف ماركتها
        </p>
        <p>
          فنيين تركيب كاميرات مراقبة بأسعار مناسبة للكاميرات الألمانية لمراقبة
          المحلات والمولات وكاميرات مراقبة منزلية لتوفير الأمن والسلامة لعائلتك.
        </p>
        <p>
          شركة زهرة الكويت توفر أفضل أنواع العشب الصناعي مع توفير عمالة متخصصة
          لتركيب العشب الصناعي بالضمان للفلل والقصور والمتنزهات العامة والخاصة .{" "}
        </p>
      </div>

      {/* ✅ SECTION: Google Map */}
      <div style={{ height: "400px", width: "100%", margin: "20px 0" }}>
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3477.338393698736!2d48.028!3d29.337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fcf9e4e2e2e2e2e%3A0x123456789abcdef!2z2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg2KfZhNmF2YjYsdmK2Kkg!5e0!3m2!1sar!2skw!4v1620000000000!5m2!1sar!2skw"
          allowFullScreen
        ></iframe>
      </div>

      {/* ✅ SECTION: Tags */}
      <div className="tags-container">
        <span className="tag">#سباك صحي جمعية قرطبة</span>
        <span className="tag">#سباك صحي جمعية قرطبة</span>
        <span className="tag">#الفني الصحي جمعية قرطبة</span>
        <span className="tag">#فني صحي جمعية قرطبة</span>
        <span className="tag">#فني صحي جمعية قرطبة</span>
        <span className="tag">#فني صحي 24 ساعه جمعية قرطبة</span>
        <span className="tag">#فني صحي جمعية قرطبة</span>
        <span className="tag">#فني صحي وسباك جمعية قرطبة</span>
        <span className="tag">#فني صحية جمعية قرطبة</span>
        <span className="tag">#معلم ادوات صحية جمعية قرطبة</span>
        <span className="tag">#معلم ادوات صحية جمعية قرطبة</span>
        <span className="tag">#معلم صحي باكستاني جمعية قرطبة</span>
        <span className="tag">#معلم صحي جمعية قرطبة</span>
        <span className="tag">#معلم صحي ممتاز جمعية قرطبة</span>
        <span className="tag">#مهندس صحي جمعية قرطبة</span>
        <span className="tag">#مهندس مدني صرف صحي جمعية قرطبة</span>
      </div>
    </div>
  );
};

export default MainComponent;
