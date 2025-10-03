// src/pages/Admin/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../Models/firebase";
import {
  collection,
  getCountFromServer,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { getLocalUid } from "../../utils/localUser";
import "./dashboard.css";

type Msg = {
  id: string;
  name: string;
  text: string;
  createdAt?: Timestamp | null;
  readBy: Record<string, boolean>;
};

const AdminDashboard = () => {
  const currentUid = useMemo(() => getLocalUid(), []);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [latest, setLatest] = useState<Msg[]>([]);

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
    (async () => {
      try {
        const totalSnap = await getCountFromServer(collection(db, "messages"));
        setTotalCount(totalSnap.data().count ?? 0);
      } catch (error) {
        console.error("Failed to load total count", error);
        setTotalCount(null);
      }
      try {
        const todaySnap = await getCountFromServer(
          query(
            collection(db, "messages"),
            where("createdAt", ">=", startOfToday),
            where("createdAt", "<", startOfTomorrow)
          )
        );
        setTodayCount(todaySnap.data().count ?? 0);
      } catch (error) {
        console.error("Failed to load today count", error);
        setTodayCount(null);
      }
    })();
  }, [startOfToday, startOfTomorrow]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "messages"), (snap) => {
      let unread = 0;
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        if (!(data?.readBy && data.readBy[currentUid])) {
          unread += 1;
        }
      });
      setUnreadCount(unread);
    });
    return () => unsub();
  }, [currentUid]);

  useEffect(() => {
    const qLatest = query(collection(db, "messages"), orderBy("createdAt", "desc"), fbLimit(5));
    const unsub = onSnapshot(
      qLatest,
      (snap) => {
        const list: Msg[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const readBy = data?.readBy && typeof data.readBy === "object" ? data.readBy : {};
          return {
            id: docSnap.id,
            name: data?.name || "زائر",
            text: data?.text || data?.message || "",
            createdAt: data?.createdAt || null,
            readBy,
          };
        });
        setLatest(list);
        setLoadingLatest(false);
      },
      () => setLoadingLatest(false)
    );
    return () => unsub();
  }, []);

  const formatTime = (ts?: Timestamp | null) => {
    const d = ts?.toDate?.();
    if (!d) return "غير متوفر";
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
        <h1>مرحبًا بك</h1>
        <p className="subtitle">متابعة سريعة لأحدث الرسائل.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">إجمالي الرسائل</div>
          <div className="stat-value">{totalCount ?? "—"}</div>
          <Link to="/admin/messages" className="stat-link">عرض الرسائل</Link>
        </div>

        <div className="stat-card">
          <div className="stat-title">غير المقروء</div>
          <div className="stat-value highlight">{unreadCount}</div>
          <Link to="/admin/messages" className="stat-link">فتح البريد الوارد</Link>
        </div>

        <div className="stat-card">
          <div className="stat-title">رسائل اليوم</div>
          <div className="stat-value">{todayCount ?? "—"}</div>
          <div className="stat-hint">عدد الرسائل المستلمة اليوم</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>آخر الرسائل</h3>
          <Link to="/admin/messages" className="btn ghost">عرض الكل</Link>
        </div>

        {loadingLatest ? (
          <div className="list list--loading">
            <div className="skeleton" /><div className="skeleton" /><div className="skeleton" />
          </div>
        ) : latest.length === 0 ? (
          <div className="empty">لا توجد رسائل حديثة.</div>
        ) : (
          <ul className="list">
            {latest.map((m) => {
              const isRead = !!m.readBy?.[currentUid];
              return (
                <li key={m.id} className={`list-item ${!isRead ? "unread" : ""}`}>
                  <div className="item-main">
                    <div className="item-line">
                      <strong className="name">{m.name}</strong>
                      <span className="time">{formatTime(m.createdAt)}</span>
                    </div>
                    <div className="preview">{m.text || "—"}</div>
                  </div>
                  <div className="item-actions">
                    <Link to={`/admin/messages/${m.id}`} className="btn">عرض التفاصيل</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="quick-grid">
        <Link to="/admin/messages" className="quick-card">إدارة الرسائل</Link>
        <Link to="/admin/settings" className="quick-card">إعدادات النظام</Link>
        <Link to="/admin/dashboard" className="quick-card">لوحة التحكم</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;