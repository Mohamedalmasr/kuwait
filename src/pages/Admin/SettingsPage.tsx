import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from "firebase/auth";
import { auth } from "../../Models/firebase";
import "./settings.css";

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loadingUser, setLoadingUser] = useState(!auth.currentUser);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileOk, setProfileOk] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailOk, setEmailOk] = useState("");
  const [emailErr, setEmailErr] = useState("");

  // Password
  const [currentPwd, setCurrentPwd] = useState("");
  const [nextPwd, setNextPwd] = useState("");
  const [nextPwd2, setNextPwd2] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdOk, setPwdOk] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
      if (u?.displayName) setDisplayName(u.displayName);
      else setDisplayName("");
      setNewEmail(u?.email || "");
    });
    return () => unsub();
  }, []);

  // Helpers
  const errAr = (code: string) => {
    switch (code) {
      case "auth/invalid-email": return "البريد الإلكتروني غير صالح.";
      case "auth/email-already-in-use": return "هذا البريد مستخدم بالفعل.";
      case "auth/weak-password": return "كلمة المرور ضعيفة.";
      case "auth/wrong-password":
      case "auth/invalid-credential": return "كلمة المرور الحالية غير صحيحة.";
      case "auth/requires-recent-login": return "يرجى إعادة تسجيل الدخول لإجراء هذا التغيير.";
      case "auth/too-many-requests": return "محاولات كثيرة. حاول لاحقًا.";
      case "auth/network-request-failed": return "مشكلة في الاتصال بالإنترنت.";
      default: return "حدث خطأ غير متوقع. حاول مجددًا.";
    }
  };

  const reauth = async (password: string) => {
    if (!user?.email) throw new Error("لا يوجد بريد للمستخدم الحالي.");
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);
  };

  // Save displayName
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileOk(""); setProfileErr("");
    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() || "" });
      setProfileOk("تم تحديث الاسم بنجاح ✅");
    } catch (e: any) {
      setProfileErr(errAr(e?.code || ""));
    } finally {
      setSavingProfile(false);
    }
  };

  // Change email (needs reauth)
  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEmailOk(""); setEmailErr("");
    if (!newEmail.trim()) {
      setEmailErr("من فضلك أدخل بريدًا صحيحًا.");
      return;
    }
    if (!emailPassword) {
      setEmailErr("من فضلك أدخل كلمة المرور الحالية لتأكيد تغيير البريد.");
      return;
    }
    setSavingEmail(true);
    try {
      await reauth(emailPassword);
      await updateEmail(user, newEmail.trim());
      setEmailOk("تم تحديث البريد الإلكتروني بنجاح ✅");
      setEmailPassword("");
    } catch (e: any) {
      setEmailErr(errAr(e?.code || ""));
    } finally {
      setSavingEmail(false);
    }
  };

  // Change password (needs reauth)
  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPwdOk(""); setPwdErr("");
    if (!currentPwd) {
      setPwdErr("أدخل كلمة المرور الحالية.");
      return;
    }
    if (nextPwd.length < 6) {
      setPwdErr("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    if (nextPwd !== nextPwd2) {
      setPwdErr("تأكيد كلمة المرور غير متطابق.");
      return;
    }
    setSavingPwd(true);
    try {
      await reauth(currentPwd);
      await updatePassword(user, nextPwd);
      setPwdOk("تم تغيير كلمة المرور بنجاح ✅");
      setCurrentPwd(""); setNextPwd(""); setNextPwd2("");
    } catch (e: any) {
      setPwdErr(errAr(e?.code || ""));
    } finally {
      setSavingPwd(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="settings-page">
        <div className="card">جارٍ تحميل بيانات الحساب…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-page">
        <div className="card" style={{ color: "#b91c1c" }}>
          لا يوجد مستخدم مسجّل.
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page" dir="rtl">
      <h2 className="sp-title">الإعدادات</h2>

      {/* الملف الشخصي */}
      <form className="card form-grid" onSubmit={saveProfile} noValidate>
        <h3 className="section-title">الملف الشخصي</h3>

        {profileOk && <div className="alert ok">{profileOk}</div>}
        {profileErr && <div className="alert err">{profileErr}</div>}

        <div className="field">
          <label htmlFor="displayName">الاسم المعروض</label>
          <input
            id="displayName"
            className="input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="اكتب اسمك"
            autoComplete="name"
            disabled={savingProfile}
          />
        </div>

        <div className="actions">
          <button className="btn primary" type="submit" disabled={savingProfile}>
            {savingProfile ? "جاري الحفظ…" : "حفظ"}
          </button>
        </div>
      </form>

      {/* البريد الإلكتروني */}
      <form className="card form-grid" onSubmit={saveEmail} noValidate>
        <h3 className="section-title">البريد الإلكتروني</h3>

        {emailOk && <div className="alert ok">{emailOk}</div>}
        {emailErr && <div className="alert err">{emailErr}</div>}

        <div className="field">
          <label htmlFor="newEmail">البريد الإلكتروني</label>
          <input
            id="newEmail"
            className="input"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="example@mail.com"
            autoComplete="email"
            disabled={savingEmail}
          />
        </div>

        <div className="field">
          <label htmlFor="emailPassword">كلمة المرور الحالية (للتأكيد)</label>
          <input
            id="emailPassword"
            className="input"
            type="password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={savingEmail}
          />
        </div>

        <div className="actions">
          <button className="btn" type="submit" disabled={savingEmail}>
            {savingEmail ? "جاري التحديث…" : "تحديث البريد"}
          </button>
        </div>
      </form>

      {/* كلمة المرور */}
      <form className="card form-grid" onSubmit={savePassword} noValidate>
        <h3 className="section-title">تغيير كلمة المرور</h3>

        {pwdOk && <div className="alert ok">{pwdOk}</div>}
        {pwdErr && <div className="alert err">{pwdErr}</div>}

        <div className="field">
          <label htmlFor="currentPwd">كلمة المرور الحالية</label>
          <input
            id="currentPwd"
            className="input"
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={savingPwd}
          />
        </div>

        <div className="field">
          <label htmlFor="nextPwd">كلمة المرور الجديدة</label>
          <input
            id="nextPwd"
            className="input"
            type="password"
            value={nextPwd}
            onChange={(e) => setNextPwd(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={savingPwd}
          />
        </div>

        <div className="field">
          <label htmlFor="nextPwd2">تأكيد كلمة المرور الجديدة</label>
          <input
            id="nextPwd2"
            className="input"
            type="password"
            value={nextPwd2}
            onChange={(e) => setNextPwd2(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={savingPwd}
          />
        </div>

        <div className="actions">
          <button className="btn danger" type="submit" disabled={savingPwd}>
            {savingPwd ? "جاري التغيير…" : "تغيير كلمة المرور"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
