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

  // حدود اليوم (من 00:00 إلى 23:59)
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(d);
  }, []);
  const startOfTomorrow = useMemo(() => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return Timestamp.fromDate(d);
  }, []);

  useEffect(() => {
    let unsubLatest: (() => void) | null = null;
    (async () => {
      try {
        // 1) إجمالي الرسائل
        const totalSnap = await getCountFromServer(collection(db, "messages"));
        setTotalCount(totalSnap.data().count);

        // 2) غير المقروء
        const unreadSnap = await getCountFromServer(
          query(collection(db, "messages"), where("read", "==", false))
        );
        setUnreadCount(unreadSnap.data().count);

        // 3) رسائل اليوم
        const todaySnap = await getCountFromServer(
          query(
            collection(db, "messages"),
            where("createdAt", ">=", startOfToday),
            where("createdAt", "<", startOfTomorrow)
          )
        );
        setTodayCount(todaySnap.data().count);

        // 4) آخر 5 رسائل
        const qLatest = query(
          collection(db, "messages"),
          orderBy("createdAt", "desc"),
          fbLimit(5)
        );
        unsubLatest = onSnapshot(qLatest, (snap) => {
          const list: Msg[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              name: data?.name || "مستخدم",
              phone: data?.phone || "",
              message: data?.message || "",
              read: !!data?.read,
              createdAt: data?.createdAt || null,
            };
          });
          setLatest(list);
          setLoading(false);
        });
      } catch (e) {
        // حتى لو فشل count نعرض الصفحة بدون انهيار
        setLoading(false);
      }
    })();

    return () => {
      if (unsubLatest) unsubLatest();
    };
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
        <h1>
          مرحباً {user?.displayName ? user.displayName : "بك"} 👋
        </h1>
        <p className="subtitle">
          هذه نظرة عامة سريعة على آخر الرسائل ونشاط اليوم.
        </p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">إجمالي الرسائل</div>
          <div className="stat-value">
            {totalCount === null ? "…" : totalCount}
          </div>
          <Link to="/admin/messages" className="stat-link">
            عرض الكل
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-title">غير مقروء</div>
          <div className="stat-value highlight">
            {unreadCount === null ? "…" : unreadCount}
          </div>
          <Link to="/admin/messages" className="stat-link">
            الذهاب للرسائل
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-title">رسائل اليوم</div>
          <div className="stat-value">
            {todayCount === null ? "…" : todayCount}
          </div>
          <div className="stat-hint">منذ منتصف الليل</div>
        </div>
      </div>

      {/* آخر الرسائل */}
      <div className="panel">
        <div className="panel-head">
          <h3>أحدث الرسائل</h3>
          <Link to="/admin/messages" className="btn ghost">
            عرض جميع الرسائل
          </Link>
        </div>

        {loading ? (
          <div className="list list--loading">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
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
                  <Link to={`/admin/messages/${m.id}`} className="btn">
                    عرض التفاصيل
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* روابط سريعة */}
      <div className="quick-grid">
        <Link to="/admin/messages" className="quick-card">
          📩 الذهاب للرسائل
        </Link>
        <Link to="/admin/settings" className="quick-card">
          ⚙️ إعدادات الحساب
        </Link>
        <Link to="/admin/dashboard" className="quick-card">
          🏠 الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
