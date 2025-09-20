import { NavLink } from "react-router-dom";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import { generateServiceUrl } from "../utils/urls";
import { slugify } from "../utils/slug";
import {
  ALL_SERVICES,
  servicesPlumbing,
  servicesPlumber,
  servicesDrainage,
  servicesMaintenance,
  servicesInstallation
} from "../data";

export type SidebarArticle = {
  id?: string | number;
  title: string;
  slug?: string;
  urlSlug?: string;
};

export type SidebarCategory = {
  label: string;
  to: string; // رابط جاهز للتصنيف (مثلاً: "/services/plumbing")
  count: number;
};

type SidebarWidgetsProps = {
  latest?: SidebarArticle[];
  categories?: SidebarCategory[];
  titleLatest?: string;
  titleCategories?: string;
  className?: string; // لو عايز تضيف كلاس خارجي
  showCounts?: boolean; // عرض الأرقام بجانب التصنيفات
};

const SidebarWidgets = ({
  latest,
  categories,
  titleLatest = "أحدث المقالات",
  titleCategories = "تصنيفات",
  className = "",
  showCounts = true,
}: SidebarWidgetsProps) => {
  // إذا لم يتم تمرير latest، استخدم أحدث المقالات من البيانات المركزية
  const latestArticles = latest || ALL_SERVICES.slice(0, 5);

  // إذا لم يتم تمرير categories، أنشئها من البيانات المركزية مع الأرقام
  const defaultCategories: SidebarCategory[] = categories || [
    { label: "سباكة", to: "/services/plumbing", count: servicesPlumbing.length },
    { label: "سباك الكويت", to: "/services/plumber", count: servicesPlumber.length },
    { label: "تسليك المجاري", to: "/services/drainage", count: servicesDrainage.length },
    { label: "صيانة منزلية", to: "/services/maintenance", count: servicesMaintenance.length },
    { label: "تركيب أدوات صحية", to: "/services/installation", count: servicesInstallation.length },
  ];

  const toArticle = (a: SidebarArticle, idx: number) => {
    const s = a.slug || a.urlSlug || slugify(a.title, "preserve-arabic");
    return generateServiceUrl({
      id: a.id ?? idx,
      title: a.title,
      slug: s,
      urlSlug: s,
    });
  };

  return (
    <aside className={`plumbing-sidebar ${className}`}>
      {/* أحدث المقالات */}
      {latestArticles.length > 0 && (
        <div className="plumbing-sidebar-box">
          <div className="plumbing-sidebar-title">
            <FaFileAlt /> {titleLatest}
          </div>
          <ul className="plumbing-sidebar-list">
            {latestArticles.map((a, i) => (
              <li key={a.id ?? a.slug ?? a.urlSlug ?? i}>
                <NavLink to={toArticle(a, i)}>{a.title}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* التصنيفات */}
      {defaultCategories.length > 0 && (
        <div className="plumbing-sidebar-box">
          <div className="plumbing-sidebar-title">
            <FaFolder /> {titleCategories}
          </div>
          <ul className="plumbing-sidebar-list">
            {defaultCategories.map((c, i) => (
              <li key={`${c.to}-${i}`}>
                <NavLink to={c.to}>
                  {c.label}
                  {showCounts && <span className="category-count">({c.count})</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default SidebarWidgets;
