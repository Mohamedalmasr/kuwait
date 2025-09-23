import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ALL_SERVICES } from "../data/services";
import { searchServices } from "../utils/search";
import { generateServiceUrl } from "../utils/urls";

import "../styles/search-results.css";

const EMPTY_QUERY_MESSAGE = "اكتب كلمة للبحث في خدمات الموقع.";
const NO_RESULTS_MESSAGE = "لم نعثر على نتائج مطابقة، جرّب كلمات أخرى أو تواصل معنا.";
const RESULTS_TITLE = "نتائج البحث";
const QUERY_PREFIX = "عن";

const SearchResults = () => {
  const [params] = useSearchParams();
  const query = (params.get("q") ?? "").trim();

  const results = useMemo(() => {
    if (!query) return [];
    return searchServices(ALL_SERVICES, query);
  }, [query]);

  return (
    <div className="search-results-page" dir="rtl">
      <header className="search-results-header">
        <h1>{RESULTS_TITLE}</h1>
        {query ? (
          <p className="search-query">
            {QUERY_PREFIX} "{query}"
          </p>
        ) : (
          <p className="search-query">{EMPTY_QUERY_MESSAGE}</p>
        )}
      </header>

      {!query ? (
        <div className="search-empty" role="status">
          {EMPTY_QUERY_MESSAGE}
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty" role="status">
          {NO_RESULTS_MESSAGE}
        </div>
      ) : (
        <ul className="search-results-list">
          {results.map((item, idx) => (
            <li key={item.urlSlug ?? idx} className="search-result-item">
              <Link to={generateServiceUrl(item)} className="result-card">
                {item.img && (
                  <img src={item.img} alt={item.title} loading="lazy" />
                )}
                <div className="result-info">
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
