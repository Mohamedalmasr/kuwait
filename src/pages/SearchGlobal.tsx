import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FaTimes } from "react-icons/fa";

import { ALL_SERVICES } from "../data";
import { searchServices, normalizeArabic } from "../utils/search";
import { generateServiceUrl } from "../utils/urls";

import "../styles/search-global.css";

const MAX_SUGGESTIONS = 6;

const SearchGlobal = () => {
  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  const suggestions = useMemo(() => {
    const q = term.trim();
    if (!q || normalizeArabic(q).length < 2) return [];
    return searchServices(ALL_SERVICES, q, MAX_SUGGESTIONS);
  }, [term]);

  const clear = () => {
    setTerm("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setFocused(false);
    setTerm(""); // صفّر بعد الانتقال
  };

  const goToSuggestion = (slug: string) => {
    navigate(generateServiceUrl({ id: slug, title: "", slug, urlSlug: slug }));
    setFocused(false);
    setTerm(""); // صفّر بعد اختيار اقتراح
  };

  return (
    <form className="sg-search" onSubmit={onSubmit} role="search" aria-label="بحث" dir="rtl">
      <div className="sg-inner">
        <div className="sg-field">
          <input
            ref={inputRef}
            type="search"
            className="sg-input"
            placeholder="ابحث هنا..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            aria-autocomplete="list"
            aria-expanded={focused && suggestions.length > 0}
            aria-controls="sg-suggest"
          />
          {term && (
            <button
              type="button"
              className="sg-clear"
              aria-label="مسح"
              onMouseDown={(e) => {
                e.preventDefault();
                clear();
              }}
              title="مسح النص"
            >
              <FaTimes aria-hidden />
            </button>
          )}
        </div>

        <button type="submit" className="sg-submit" aria-label="ابحث" title="ابحث">
          <FontAwesomeIcon icon={faSearch} />
        </button>

        {mounted && focused && suggestions.length > 0 && (
          <ul className="sg-suggestions" id="sg-suggest" role="listbox">
            {suggestions.map((s) => (
              <li key={s.urlSlug}>
                <button
                  type="button"
                  className="sg-suggestion-btn"
                  onMouseDown={() => goToSuggestion(s.urlSlug)}
                  aria-label={`اذهب إلى ${s.title}`}
                >
                  <span className="sg-sug-title">{s.title}</span>
                  <span className="sg-sug-hint">{s.text?.slice(0, 60) || ""}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
};

export default SearchGlobal;
