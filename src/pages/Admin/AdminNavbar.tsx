import { useEffect, useRef, useState } from "react";
import { FaBell, FaEnvelope, FaUserCog, FaSignOutAlt } from "react-icons/fa";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../Models/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit as fbLimit,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import "./navbar.css";

type InboxItem = {
  id: string;
  name: string;
  message: string;
  read: boolean;
  createdAt?: Timestamp | null;
};

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<InboxItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [working, setWorking] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // عدّاد غير المقروء من مجموعة messages
  useEffect(() => {
    const qUnread = query(collection(db, "messages"), where("read", "==", false));
    const unsub = onSnapshot(qUnread, (snap) => setUnreadCount(snap.size));
    return () => unsub();
  }, []);

  // أحدث 10 رسائل
  useEffect(() => {
    const qLatest = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      fbLimit(10)
    );
    const unsub = onSnapshot(qLatest, (snap) => {
      const list: InboxItem[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data?.name || "مستخدم",
          message: data?.message || "رسالة جديدة",
          read: !!data?.read,
          createdAt: data?.createdAt || null,
        };
      });
      setLatest(list);
    });
    return () => unsub();
  }, []);

  // إغلاق القائمة عند الضغط خارجها / Esc / تغيير المسار
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowDropdown(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [showDropdown]);

  useEffect(() => setShowDropdown(false), [location.pathname]);

  const markAsRead = async (id: string) => {
    try {
      setShowDropdown(false);
      await updateDoc(doc(db, "messages", id), { read: true });
      navigate(`/admin/messages/${id}`);
    } catch (e) {
      console.error("markAsRead error:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      setWorking(true);
      const qUnreadAll = query(collection(db, "messages"), where("read", "==", false));
      const snap = await getDocs(qUnreadAll);
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
      setShowDropdown(false);
    } catch (e) {
      console.error("markAllAsRead error:", e);
    } finally {
      setWorking(false);
    }
  };

  const formatTime = (ts?: Timestamp | null) => {
    const d = ts?.toDate?.() ?? new Date();
    return d.toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <header className="admin-navbar" dir="rtl">
      <div className="navbar-brand">
        <Link to="/admin/dashboard" className="logo-link">
          <span className="logo-icon" aria-hidden>🛡️</span>
          <span className="logo-text">لوحة التحكم</span>
        </Link>
      </div>

      <nav className="navbar-links">
        {/* زر يرجع للداشبورد من أي صفحة */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span>الصفحة الرئيسية</span>
        </NavLink>

        <NavLink
          to="/admin/messages"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <FaEnvelope className="link-icon" />
          <span>الرسائل</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <FaUserCog className="link-icon" />
          <span>الإعدادات</span>
        </NavLink>
      </nav>

      <div className="navbar-actions">
        <div className="notifications-wrapper">
          <button
            ref={btnRef}
            className="notifications-btn"
            onClick={() => setShowDropdown((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            aria-label="الرسائل الجديدة"
            title="الرسائل الجديدة"
          >
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div ref={dropdownRef} className="notifications-dropdown" role="menu">
              <div className="dropdown-header">
                <h4>الرسائل غير المقروءة ({unreadCount})</h4>
                <button
                  className="mark-all-read"
                  onClick={markAllAsRead}
                  disabled={working || unreadCount === 0}
                  title="تحديد الكل كمقروء"
                >
                  تحديد الكل كمقروء
                </button>
              </div>

              {latest.length > 0 ? (
                <div className="notifications-list">
                  {latest.map((item) => (
                    <button
                      key={item.id}
                      className={`notification-item ${!item.read ? "unread" : ""}`}
                      onClick={() => markAsRead(item.id)}
                      title={item.message}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{item.message}</p>
                        <small className="notification-time">
                          {formatTime(item.createdAt)}
                        </small>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-notifications">لا توجد رسائل</div>
              )}

              <Link to="/admin/messages" className="view-all-link">
                عرض جميع الرسائل
              </Link>
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
