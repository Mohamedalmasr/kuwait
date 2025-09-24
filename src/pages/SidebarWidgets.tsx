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
  servicesInstallation,
} from "../data/services";

export type SidebarArticle = {
  id?: string | number;
  title: string;
  slug?: string;
  urlSlug?: string;
};

export type SidebarCategory = {
  label: string;
  to: string;
  count: number;
};

type SidebarWidgetsProps = {
  latest?: SidebarArticle[];
  categories?: SidebarCategory[];
  titleLatest?: string;
  titleCategories?: string;
  className?: string;
  showCounts?: boolean;
};

const FALLBACK_LATEST_TITLE = "أحدث المقالات";
const FALLBACK_CATEGORIES_TITLE = "تصنيفات";

const SidebarWidgets = ({
  latest,
  categories,
  titleLatest = FALLBACK_LATEST_TITLE,
  titleCategories = FALLBACK_CATEGORIES_TITLE,
  showCounts = true,
}: SidebarWidgetsProps) => {
  const latestArticles = latest || ALL_SERVICES.slice(0, 5);

  const defaultCategories: SidebarCategory[] = categories || [
    { label: "خدمات السباكة", to: "/services/plumbing", count: servicesPlumbing.length },
    { label: "فني صحي متخصص", to: "/services/plumber", count: servicesPlumber.length },
    { label: "تنظيف مجاري وصرف صحي", to: "/services/drainage", count: servicesDrainage.length },
    { label: "الصيانة العامة", to: "/services/maintenance", count: servicesMaintenance.length },
    { label: "تركيبات صحية", to: "/services/installation", count: servicesInstallation.length },
  ];

  const toArticle = (a: SidebarArticle, idx: number) => {
    const slug = a.slug || a.urlSlug || slugify(a.title, "preserve-arabic");
    return generateServiceUrl({
      id: a.id ?? idx,
      title: a.title,
      slug,
      urlSlug: slug,
    });
  };

  return (
    <aside className="plumbing-sidebar">
      {latestArticles.length > 0 && (
        <div className="plumbing-sidebar-box">
          <div className="plumbing-sidebar-title">
            <FaFileAlt /> {titleLatest}
          </div>
          <ul className="plumbing-sidebar-list">
            {latestArticles.map((article, index) => (
              <li key={article.id ?? article.slug ?? article.urlSlug ?? index}>
                <NavLink to={toArticle(article, index)}>{article.title}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {defaultCategories.length > 0 && (
        <div className="plumbing-sidebar-box">
          <div className="plumbing-sidebar-title">
            <FaFolder /> {titleCategories}
          </div>
          <ul className="plumbing-sidebar-list">
            {defaultCategories.map((category, index) => (
              <li key={`${category.to}-${index}`}>
                <NavLink to={category.to}>
                  {category.label}
                  {showCounts && <span className="category-count">({category.count})</span>}
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


