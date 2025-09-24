import { Link } from "react-router-dom";
import { FaTools, FaWrench, FaWater, FaToolbox, FaCogs } from "react-icons/fa";

import {
  servicesPlumbing,
  servicesPlumber,
  servicesDrainage,
  servicesMaintenance,
  servicesInstallation,
} from "../data/services";

import SidebarWidgets from "./SidebarWidgets";
import "../styles/services-index.css";

const categories = [
  {
    id: "plumbing",
    label: "خدمات السباكة",
    description:
      "تركيب وصيانة مواسير المياه، معالجة التسريبات وإصلاح الأعطال المنزلية.",
    to: "/services/plumbing",
    count: servicesPlumbing.length,
    icon: <FaTools />,
  },
  {
    id: "plumber",
    label: "فني صحي",
    description:
      "فنيون متخصصون لمعالجة الأعطال الطارئة وخدمات الإصلاح السريع داخل المنازل.",
    to: "/services/plumber",
    count: servicesPlumber.length,
    icon: <FaWrench />,
  },
  {
    id: "drainage",
    label: "تنظيف مجاري وصرف صحي",
    description:
      "حلول متكاملة لتسليك المجاري وتنظيف خطوط الصرف الصحي بأحدث الأجهزة.",
    to: "/services/drainage",
    count: servicesDrainage.length,
    icon: <FaWater />,
  },
  {
    id: "maintenance",
    label: "صيانة عامة",
    description:
      "برامج صيانة دورية للمباني والمنازل، وخدمات الإصلاح الوقائي." ,
    to: "/services/maintenance",
    count: servicesMaintenance.length,
    icon: <FaToolbox />,
  },
  {
    id: "installation",
    label: "تركيبات ومشاريع",
    description:
      "تنفيذ مشاريع تركيب الأنظمة الصحية، المطابخ، والحمامات الجديدة.",
    to: "/services/installation",
    count: servicesInstallation.length,
    icon: <FaCogs />,
  },
];

const ServicesIndex = () => {
  return (
    <div className="services-index" dir="rtl">
      <section className="page-header">
        <div className="breadcrumb">خدماتنا</div>
        <h1>جميع الخدمات</h1>
        <p className="intro">اختر القسم المناسب للتعرف على تفاصيل الخدمات المتاحة لدينا.</p>
      </section>

      <div className="services-index-body">
        <section className="services-grid" aria-label="أقسام الخدمات">
          {categories.map((category) => (
            <article key={category.id} className="service-category-card">
              <header className="card-header">
                <span className="card-icon" aria-hidden>
                  {category.icon}
                </span>
                <div>
                  <h2>{category.label}</h2>
                  <p className="count">{category.count} خدمة</p>
                </div>
              </header>

              <p className="card-text">{category.description}</p>

              <Link to={category.to} className="card-link">
                استعرض الخدمات
              </Link>
            </article>
          ))}
        </section>

        <SidebarWidgets titleLatest="أحدث المقالات" titleCategories="تصنيفات" />
      </div>
    </div>
  );
};

export default ServicesIndex;

