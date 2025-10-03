// src/pages/Contact.tsx
import { useState } from "react";
import "../styles/contact.css";

import { db } from "../Models/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { normalizePhone } from "../utils/phone";
import { getLocalUid } from "../utils/localUser";

type FormState = {
  name: string;
  phone: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const PREFERRED_ISO = "KW";

const Contact = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const sanitize = (value: string) => value.replace(/\s+/g, " ").trim();

  const normalizePhoneBasic = (value: string) => {
    const plus = value.trim().startsWith("+");
    const digits = value.replace(/\D/g, "");
    return plus ? `+${digits}` : digits;
  };

  const validateField = (name: keyof FormState, value: string) => {
    const v = sanitize(value);
    if (name === "name") {
      if (v.length < 2 || v.length > 80) {
        return "«·«”„ ÌÃ» √‰ ÌﬂÊ‰ »Ì‰ 2 Ê 80 Õ—›«";
      }
    }
    if (name === "message") {
      if (v.length < 5 || v.length > 2000) {
        return "«·—”«·… ÌÃ» √‰  ﬂÊ‰ »Ì‰ 5 Ê 2000 Õ—›";
      }
    }
    if (name === "phone") {
      if (!v) {
        return "";
      }
      const digits = v.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return "—ﬁ„ «·Â« › €Ì— ’ÕÌÕ";
      }
    }
    return "";
  };

  const validateAll = (values: FormState) => {
    const errs: FormErrors = {};
    const nameErr = validateField("name", values.name);
    if (nameErr) errs.name = nameErr;
    const phoneErr = validateField("phone", values.phone);
    if (phoneErr) errs.phone = phoneErr;
    const messageErr = validateField("message", values.message);
    if (messageErr) errs.message = messageErr;
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setOkMsg("");
    setErrMsg("");
    const fieldErr = validateField(name as keyof FormState, value);
    setErrors((prev) => ({ ...prev, [name]: fieldErr || undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldErr = validateField(name as keyof FormState, value);
    setErrors((prev) => ({ ...prev, [name]: fieldErr || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg("");
    setErrMsg("");

    if (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) {
      setErrMsg("·« Ì„ﬂ‰ «·≈—”«· »œÊ‰ « ’«· »«·≈‰ —‰ ");
      return;
    }

    const cleaned: FormState = {
      name: sanitize(form.name),
      phone: sanitize(form.phone),
      message: sanitize(form.message),
    };

    const validation = validateAll(cleaned);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setErrMsg("Ì—ÃÏ  ’ÕÌÕ «·ÕﬁÊ· «·≈·“«„Ì…");
      return;
    }

    let phoneRaw = cleaned.phone;
    let phoneE164: string | null = null;
    let phoneIntlDigits: string | null = null;
    let phoneCountryIso: string | null = null;

    if (phoneRaw) {
      const normalized = normalizePhone(phoneRaw, { preferredIso: PREFERRED_ISO });
      if (normalized.ok) {
        phoneE164 = normalized.e164;
        phoneIntlDigits = normalized.intlDigits;
        phoneCountryIso = normalized.country.iso2;
      } else {
        const basic = normalizePhoneBasic(phoneRaw);
        phoneE164 = basic.startsWith("+") ? basic : null;
        phoneIntlDigits = basic.startsWith("+") ? basic.slice(1) : basic || null;
        phoneCountryIso = null;
      }
    }

    setLoading(true);
    try {
      const senderUid = getLocalUid();

      await addDoc(collection(db, "messages"), {
        name: cleaned.name,
        phone: phoneRaw || null,
        phoneE164,
        phoneIntl: phoneIntlDigits,
        phoneCountry: phoneCountryIso,
        text: cleaned.message,
        senderUid,
        readBy: { [senderUid]: true },
        deletedFor: {},
        createdAt: serverTimestamp(),
        ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
        ref: typeof window !== "undefined" ? window.location.pathname : null,
      });

      setOkMsg(" „ ≈—”«· «·—”«·… »‰Ã«Õ.");
      setForm({ name: "", phone: "", message: "" });
      setErrors({});
    } catch (error) {
      console.error("›‘· ≈—”«· «·—”«·…:", error);
      setErrMsg("ÕœÀ Œÿ√ √À‰«¡ ≈—”«· «·—”«·…. Õ«Ê· „—… √Œ—Ï.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rtl" dir="rtl">
      <section className="page-header">
        <div className="breadcrumb">«·—∆Ì”Ì… /  Ê«’· „⁄‰«</div>
        <h1> Ê«’· „⁄‰«</h1>
      </section>

      <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {okMsg && (
            <div className="contact-alert contact-alert--ok" role="status" aria-live="polite">
              {okMsg}
            </div>
          )}
          {errMsg && (
            <div className="contact-alert contact-alert--err" role="alert" aria-live="assertive">
              {errMsg}
            </div>
          )}

          <div className={`form-field ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="name">«·«”„</label>
            <input
              className={`input ${errors.name ? "input--error" : ""}`}
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="«ﬂ » «”„ﬂ"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={loading}
            />
            {errors.name && (
              <div id="name-error" className="field-error">{errors.name}</div>
            )}
          </div>

          <div className={`form-field ${errors.phone ? "has-error" : ""}`}>
            <label htmlFor="phone">—ﬁ„ «·Â« ›</label>
            <input
              className={`input ${errors.phone ? "input--error" : ""}`}
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="„À«·: 96550123456"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              disabled={loading}
            />
            {errors.phone && (
              <div id="phone-error" className="field-error">{errors.phone}</div>
            )}
          </div>

          <div className={`form-field ${errors.message ? "has-error" : ""}`}>
            <label htmlFor="message">—”«· ﬂ</label>
            <textarea
              className={`input ${errors.message ? "input--error" : ""}`}
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="«ﬂ »  ›«’Ì· «·ÿ·» √Ê «·«” ›”«—"
              rows={5}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              disabled={loading}
            />
            {errors.message && (
              <div id="message-error" className="field-error">{errors.message}</div>
            )}
          </div>

          <button type="submit" className="send-btn" disabled={loading}>
            {loading ? "Ã«—Ì «·≈—”«·..." : "≈—”«·"}
          </button>

          <p className="contact-hint">‰Õ —„ Œ’Ê’Ì ﬂ° Ê·‰ ‰‘«—ﬂ »Ì«‰« ﬂ „⁄ √Ì ÃÂ… √Œ—Ï.</p>
        </form>

        <div className="contact-info">
          <h3>»Ì«‰«  «· Ê«’·</h3>
          <p>«·Â« ›: <a href="tel:+96551751604">+965 5175 1604</a></p>
          <p>«·»—Ìœ: <a href="mailto:info@kuwait.com">info@kuwait.com</a></p>
          <p>«·⁄‰Ê«‰: «·ﬂÊÌ  - ‘«—⁄ «·„À«· - „»‰Ï 12</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
