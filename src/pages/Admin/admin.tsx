import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./admin.css";
import { auth } from "../../Models/firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "firebase/auth";

type AdminProps = { onLogin?: () => void };

const Admin = ({ onLogin }: AdminProps) => {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // لو داخل بالفعل، ودّيه للداشبورد
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("adminAuth", "true"); // متوافقة مع AuthLayout
        const redirectTo =
          (location.state as any)?.from?.pathname || "/admin/dashboard";
        navigate(redirectTo, { replace: true });
      }
    });
    return () => unsub();
  }, [navigate, location.state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const errorToArabic = (code: string) => {
    switch (code) {
      case "auth/invalid-email":
        return "البريد الإلكتروني غير صالح.";
      case "auth/user-disabled":
        return "هذا الحساب تم إيقافه.";
      case "auth/user-not-found":
        return "لا يوجد مستخدم بهذا البريد.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "البريد أو كلمة المرور غير صحيحة.";
      case "auth/too-many-requests":
        return "محاولات كثيرة. جرّب لاحقًا.";
      case "auth/network-request-failed":
        return "مشكلة في الاتصال بالإنترنت.";
      default:
        return "حدث خطأ غير متوقع. حاول مرة أخرى.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // تذكرني = localStorage، غير كده = sessionStorage
      await setPersistence(
        auth,
        form.remember ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);

      // onAuthStateChanged أعلاه هيتكفّل بالتحويل
      onLogin?.();
    } catch (err: any) {
      setErrorMsg(errorToArabic(err?.code || ""));
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <Link to="/" className="back-to-site-btn">
        العودة للموقع الرئيسي
      </Link>

      <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
        <h2>تسجيل دخول الأدمن</h2>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <label className="field">
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            disabled={loading}
          />
        </label>

        <label className="field password-field">
          <input
            type={showPwd ? "text" : "password"}
            name="password"
            placeholder="كلمة المرور"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-pwd"
            onClick={() => setShowPwd((s) => !s)}
            aria-label={showPwd ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            title={showPwd ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={showPwd}
            disabled={loading}
          >
            {showPwd ? <FaEyeSlash aria-hidden={true} /> : <FaEye aria-hidden={true} />}
          </button>
        </label>

        <label className="remember-row">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            disabled={loading}
          />
          <span>تذكرني على هذا الجهاز</span>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
};

export default Admin;


