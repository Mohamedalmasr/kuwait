
import { useEffect, useRef, useState } from "react";
import { FaBell, FaEnvelope, FaUserCog, FaSignOutAlt } from "react-icons/fa";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Models/firebase";
import {
  collection,
  doc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import "./navbar.css";

type InboxItem = {
  id: string;
  name: string;
  text: string;
  readBy: Record<string, boolean>;
  deletedFor: Record<string, boolean>;
  createdAt?: Timestamp | null;
};

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUid, setCurrentUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<InboxItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [working, setWorking] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  const refreshUnreadCount = async (uid: string | null) => {
    if (!uid) {
      setUnreadCount(0);
      return;
    }
    try {
      const snap = await getDocs(
        query(collection(db, "messages"), orderBy("createdAt", "desc"), fbLimit(1000))
      );
      let read = 0;
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        if (data?.readBy && data.readBy[uid]) {
          read += 1;
        }
      });
      setUnreadCount(Math.max(snap.size - read, 0));
    } catch (error) {
      console.error("Failed to load unread count:", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refreshUnreadCount(currentUid);
  }, [currentUid]);

  useEffect(() => {
    if (!currentUid) {
      setLatest([]);
      return;
    }

    const qLatest = query(collection(db, "messages"), orderBy("createdAt", "desc"), fbLimit(10));

    const unsub = onSnapshot(qLatest, (snapshot) => {
      const items: InboxItem[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as any;
          const readBy = data?.readBy && typeof data.readBy === "object" ? data.readBy : {};
          const deletedFor = data?.deletedFor && typeof data.deletedFor === "object" ? data.deletedFor : {};
          return {
            id: docSnap.id,
            name: data?.name || "زائر",
            text: data?.text || data?.message || "رسالة بدون نص",
            readBy,
            deletedFor,
            createdAt: data?.createdAt || null,
          };
        })
        .filter((item) => !item.deletedFor?.[currentUid]);

      setLatest(items);
    });

    return () => unsub();
  }, [currentUid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showDropdown]);

  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  const markAsRead = async (id: string) => {
    if (!currentUid) return;
    try {
      setShowDropdown(false);
      await updateDoc(doc(db, "messages", id), { [`readBy.${currentUid}`]: true });
      navigate(`/admin/messages/${id}`);
      refreshUnreadCount(currentUid);
    } catch (error) {
      console.error("markAsRead error:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUid) return;
    try {
      setWorking(true);
      const snap = await getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc"), fbLimit(200)));
      const unreadDocs = snap.docs.filter((docSnap) => {
        const data = docSnap.data() as any;
        return !(data?.readBy && data.readBy[currentUid]);
      });
      if (unreadDocs.length === 0) {
        return;
      }
      const batch = writeBatch(db);
      unreadDocs.forEach((docSnap) => {
        batch.update(docSnap.ref, { [`readBy.${currentUid}`]: true });
      });
      await batch.commit();
      refreshUnreadCount(currentUid);
      setShowDropdown(false);
    } catch (error) {
      console.error("markAllAsRead error:", error);
    } finally {
      setWorking(false);
    }
  };

  const formatTime = (ts?: Timestamp | null) => {
    const date = ts?.toDate?.() ?? new Date();
    return date.toLocaleString("ar-EG", {
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
          <span className="logo-icon" aria-hidden>
            شعار
          </span>
          <span className="logo-text">لوحة التحكم</span>
        </Link>
      </div>

      <nav className="navbar-links">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span>الرئيسية</span>
        </NavLink>
        <NavLink to="/admin/messages" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <FaEnvelope className="link-icon" />
          <span>الرسائل</span>
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <FaUserCog className="link-icon" />
          <span>الإعدادات</span>
        </NavLink>
      </nav>

      <div className="navbar-actions">
        <div className="notifications-wrapper">
          <button
            ref={btnRef}
            className="notifications-btn"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            aria-label="إشعارات الرسائل"
            title="إشعارات الرسائل"
          >
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div ref={dropdownRef} className="notifications-dropdown" role="menu">
              <div className="dropdown-header">
                <h4>إشعارات الرسائل ({unreadCount})</h4>
                <button
                  className="mark-all-read"
                  onClick={markAllAsRead}
                  disabled={working || unreadCount === 0}
                  title="تعيين كل الرسائل كمقروءة"
                >
                  تعليم الكل كمقروء
                </button>
              </div>

              {latest.length > 0 ? (
                <div className="notifications-list">
                  {latest.map((item) => {
                    const isRead = currentUid ? !!item.readBy?.[currentUid] : false;
                    return (
                      <button
                        key={item.id}
                        className={`notification-item ${!isRead ? "unread" : ""}`}
                        onClick={() => markAsRead(item.id)}
                        title={item.text}
                      >
                        <div className="notification-content">
                          <p className="notification-message">{item.text}</p>
                          <small className="notification-time">{formatTime(item.createdAt)}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-notifications">لا توجد إشعارات جديدة</div>
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
