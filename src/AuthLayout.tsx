// src/AuthLayout.tsx (أو .jsx)
import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { auth } from "../src/Models/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AdminNavbar from "./pages/Admin/AdminNavbar"; // تأكد من المسار الصحيح
const AuthLayout = () => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const isLoggedIn = !!user;
      setAuthed(isLoggedIn);
      setChecking(false);

      // تزامن مع AuthLayout السابق لو بتستخدم localStorage فروع أخرى
      if (isLoggedIn) {
        localStorage.setItem("adminAuth", "true");
      } else {
        localStorage.removeItem("adminAuth");
      }
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!authed) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }} // علشان نرجع لنفس الصفحة بعد اللوجين
      />
    );
  }

 return (
    <div className="admin-layout">
      <AdminNavbar /> 
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
