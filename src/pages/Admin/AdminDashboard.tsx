// src/pages/Admin/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../Models/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  getCountFromServer,
  Timestamp,
} from "firebase/firestore";
import "./dashboard.css";

type Msg = {
  id: string;
  name: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt?: Timestamp | null;
};

const AdminDashboard = () => {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);

  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [latest, setLatest] = useState<Msg[]>([]);

  const startOfToday = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(d);
  }, []);
  const startOfTomorrow = useMemo(() => {
    const d = new Date(); d.setHours(24, 0, 0, 0);
    return Timestamp.fromDate(d);
  }, []);

  useEffect(() => {
    let unsubLatest: (() => void) | null = null;

    (async () => {
      // إجمالي الرسائل
      try {
        const totalSnap = await getCountFromServer(collection(db, "messages"));
        setTotalCount(totalSnap.data().count);
      } catch {
        setTotalCount(null);
      }

      // غير المقروء
      try {
        const unreadSnap = await getCountFromServer(
          query(collection(db, "messages"), where("read", "==", false))
        );
        setUnreadCount(unreadSnap.data().count);
      } catch {
        setUnreadCount(null);
      }

      // رسائل اليوم
      try {
        const todaySnap = await getCountFromServer(
          query(
            collection(db, "messages"),
            where("createdAt", ">=", startOfToday),
            where("createdAt", "<", startOfTomorrow)
          )
        );
        setTodayCount(todaySnap.data().count);
      } catch {
        setTodayCount(null);
      }

      // أحدث 5
      try {
        const qLatest = query(
          collection(db, "messages"),
          orderBy("createdAt", "desc"),
          fbLimit(5)
        );
        unsubLatest = onSnapshot(
          qLatest,
          (snap) => {
            const list: Msg[] = snap.docs.map((d) => {
              const x = d.data() as any;
              return {
                id: d.id,
                name: x?.name || "مستخدم",
                phone: x?.phone || "",
                message: x?.message || "",
                read: !!x?.read,
                createdAt: x?.createdAt || null,
              };
            });
            setLatest(list);
            setLoading(false);
          },
          () => {
            // fallback: بدون ترتيب، رتب محليًا وخذ أول 5
            const unsub2 = onSnapshot(collection(db, "messages"), (snap2) => {
              const list: Msg[] = snap2.docs
                .map((d) => {
                  const x = d.data() as any;
                  return {
                    id: d.id,
                    name: x?.name || "مستخدم",
                    phone: x?.phone || "",
                    message: x?.message || "",
                    read: !!x?.read,
                    createdAt: x?.createdAt || null,
                  };
                })
                .sort((a,b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
                .slice(0, 5);
              setLatest(list);
              setLoading(false);
            });
            unsubLatest = unsub2;
          }
        );
      } catch {
        setLoading(false);
      }
    })();

    return () => { if (unsubLatest) unsubLatest(); };
  }, [startOfToday, startOfTomorrow]);

  const formatTime = (ts?: Timestamp | null) => {
    const d = ts?.toDate?.();
    if (!d) return "—";
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
    <div className="admin-dashboard" dir="rtl">
      <div className="admin-header">
        <h1>مرحباً {user?.displayName ? user.displayName : "بك"} 👋</h1>
        <p className="subtitle">هذه نظرة عامة سريعة على آخر الرسائل ونشاط اليوم.</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">إجمالي الرسائل</div>
          <div className="stat-value">{totalCount === null ? "…" : totalCount}</div>
          <Link to="/admin/messages" className="stat-link">عرض الكل</Link>
        </div>

        <div className="stat-card">
          <div className="stat-title">غير مقروء</div>
          <div className="stat-value highlight">
            {unreadCount === null ? "…" : unreadCount}
          </div>
          <Link to="/admin/messages" className="stat-link">الذهاب للرسائل</Link>
        </div>

        <div className="stat-card">
          <div className="stat-title">رسائل اليوم</div>
          <div className="stat-value">{todayCount === null ? "…" : todayCount}</div>
          <div className="stat-hint">منذ منتصف الليل</div>
        </div>
      </div>

      {/* آخر الرسائل */}
      <div className="panel">
        <div className="panel-head">
          <h3>أحدث الرسائل</h3>
          <Link to="/admin/messages" className="btn ghost">عرض جميع الرسائل</Link>
        </div>

        {loading ? (
          <div className="list list--loading">
            <div className="skeleton" /><div className="skeleton" /><div className="skeleton" />
          </div>
        ) : latest.length === 0 ? (
          <div className="empty">لا توجد رسائل بعد.</div>
        ) : (
          <ul className="list">
            {latest.map((m) => (
              <li key={m.id} className={`list-item ${!m.read ? "unread" : ""}`}>
                <div className="item-main">
                  <div className="item-line">
                    <strong className="name">{m.name}</strong>
                    <span className="time">{formatTime(m.createdAt)}</span>
                  </div>
                  <div className="preview">{m.message || "—"}</div>
                </div>
                <div className="item-actions">
                  <Link to={`/admin/messages/${m.id}`} className="btn">عرض التفاصيل</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* روابط سريعة */}
      <div className="quick-grid">
        <Link to="/admin/messages" className="quick-card">📩 الذهاب للرسائل</Link>
        <Link to="/admin/settings" className="quick-card">⚙️ إعدادات الحساب</Link>
        <Link to="/admin/dashboard" className="quick-card">🏠 الصفحة الرئيسية</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
