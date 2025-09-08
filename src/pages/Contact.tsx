import { useState } from "react";
import "../styles/contact.css";

// Firebase
import { db } from "../Models/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type FormState = {
  name: string;
  phone: string;
  message: string;
  company?: string; // honeypot
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const Contact = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    message: "",
    company: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const sanitize = (v: string) => v.replace(/\s+/g, " ").trim();
  const normalizePhone = (v: string) => {
    const plus = v.trim().startsWith("+");
    const digits = v.replace(/\D/g, "");
    return plus ? `+${digits}` : digits;
  };

  const validateField = (name: keyof FormState, value: string) => {
    const v = sanitize(value);
    if (name === "name") {
      if (v.length < 2 || v.length > 80) return "من فضلك اكتب اسمًا صحيحًا (2–80 حرف).";
    }
    if (name === "message") {
      if (v.length < 5 || v.length > 2000) return "من فضلك اكتب رسالة واضحة (5–2000 حرف).";
    }
    if (name === "phone") {
      if (!v) return ""; // الهاتف اختياري
      const d = v.replace(/\D/g, "");
      if (d.length < 7 || d.length > 15) return "رقم الهاتف غير صالح.";
    }
    return "";
  };

  const validateAll = (values: FormState) => {
    const e: FormErrors = {};
    const nameErr = validateField("name", values.name);
    if (nameErr) e.name = nameErr;

    const phoneErr = validateField("phone", values.phone);
    if (phoneErr) e.phone = phoneErr;

    const msgErr = validateField("message", values.message);
    if (msgErr) e.message = msgErr;

    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setOkMsg("");
    setErrMsg("");

    // إعادة التحقق الفوري للحقل الجاري تعديله
    const err = validateField(name as keyof FormState, value);
    setErrors((prev) => ({ ...prev, [name]: err || undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const err = validateField(name as keyof FormState, value);
    setErrors((prev) => ({ ...prev, [name]: err || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg("");
    setErrMsg("");


    
    // honeypot
    if (form.company && form.company.trim() !== "") {
      setErrMsg("تم إيقاف الإرسال (اشتبهنا في سبام).");
      return;
    }

    const cleaned: FormState = {
      name: sanitize(form.name),
      phone: normalizePhone(form.phone),
      message: sanitize(form.message),
      company: "",
    };

    const eAll = validateAll(cleaned);
    setErrors(eAll);
    if (Object.keys(eAll).length > 0) {
      setErrMsg("من فضلك صحّح الحقول الموضّحة.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        name: cleaned.name,
        phone: cleaned.phone,
        message: cleaned.message,
        read: false,                 // مهم للجرس
        createdAt: serverTimestamp() // مهم للترتيب
      });

      setOkMsg("تم إرسال رسالتك بنجاح");
      setForm({ name: "", phone: "", message: "", company: "" });
      setErrors({});
    } catch (error) {
      console.error("خطأ أثناء الإرسال:", error);
      setErrMsg("حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rtl" dir="rtl">
      <section className="page-header">
        <div className="breadcrumb">الرئيسية / تواصل معنا</div>
        <h1>تواصل معنا</h1>
      </section>

      <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {/* رسائل الحالة العامة */}
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

          {/* الاسم */}
          <div className={`form-field ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="name">الاسم</label>
            <input
              className={`input ${errors.name ? "input--error" : ""}`}
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="اكتب اسمك هنا"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={loading}
            />
            {errors.name && (
              <>
                <span className="error-icon" aria-hidden>⚠</span>
                <div id="name-error" className="field-error">{errors.name}</div>
              </>
            )}
          </div>

          {/* الهاتف */}
          <div className={`form-field ${errors.phone ? "has-error" : ""}`}>
            <label htmlFor="phone">رقم الهاتف</label>
            <input
              className={`input ${errors.phone ? "input--error" : ""}`}
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="رقم الهاتف"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              disabled={loading}
            />
            {errors.phone && (
              <>
                <span className="error-icon" aria-hidden>⚠</span>
                <div id="phone-error" className="field-error">{errors.phone}</div>
              </>
            )}
          </div>

          {/* الرسالة */}
          <div className={`form-field ${errors.message ? "has-error" : ""}`}>
            <label htmlFor="message">رسالتك</label>
            <textarea
              className={`input ${errors.message ? "input--error" : ""}`}
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="اكتب رسالتك هنا"
              rows={5}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              disabled={loading}
            />
            {errors.message && (
              <>
                <span className="error-icon" aria-hidden>⚠</span>
                <div id="message-error" className="field-error">{errors.message}</div>
              </>
            )}
          </div>

          {/* Honeypot */}
          <div style={{ position: "absolute", left: "-9999px", width: 0, height: 0, overflow: "hidden" }}>
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button type="submit" className="send-btn" disabled={loading}>
            {loading ? "جارٍ الإرسال..." : "إرسال"}
          </button>

          <p className="contact-hint">سنقوم بالتواصل معك خلال وقت قصير بعد استلام رسالتك.</p>
        </form>

        <div className="contact-info">
          <h3>معلومات التواصل</h3>
          <p>الهاتف: <a href="tel:+96550000000">+96550000000</a></p>
          <p>البريد الإلكتروني: <a href="mailto:info@kuwait.com">info@kuwait.com</a></p>
          <p>العنوان: الكويت، شارع الخدمات، مبنى 12</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
