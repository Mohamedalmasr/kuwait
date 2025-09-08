// src/pages/Admin/MessageDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../Models/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { FaArrowRight, FaEnvelope, FaEnvelopeOpen, FaTrash } from "react-icons/fa";
import "./message-detail.css";

type Msg = {
  id: string;
  name: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt?: Timestamp | null;
};

const MessageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [msg, setMsg] = useState<Msg | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const telHref = useMemo(
    () => (msg?.phone ? `tel:${msg.phone.replace(/\s+/g, "")}` : "#"),
    [msg?.phone]
  );
  const waHref = useMemo(
    () => (msg?.phone ? `https://wa.me/${msg.phone.replace(/\D/g, "")}` : "#"),
    [msg?.phone]
  );

  const formatTime = (ts?: Timestamp | null) => {
    const d = ts?.toDate?.() ?? null;
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

  // جلب الرسالة + تعليم كمقروء عند الفتح
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!id) throw new Error("لا يوجد معرف رسالة.");
        const ref = doc(db, "messages", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          throw new Error("الرسالة غير موجودة.");
        }

        const data = snap.data() as any;
        const current: Msg = {
          id: snap.id,
          name: data?.name || "مستخدم",
          phone: data?.phone || "",
          message: data?.message || "",
          read: !!data?.read,
          createdAt: data?.createdAt || null,
        };

        if (mounted) setMsg(current);

        // علّمها كمقروء لو كانت غير مقروء
        if (!current.read) {
          await updateDoc(ref, { read: true });
          if (mounted) setMsg((m) => (m ? { ...m, read: true } : m));
        }
      } catch (e: any) {
        setError(e?.message || "فشل جلب الرسالة.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const toggleRead = async () => {
    if (!id || !msg) return;
    try {
      setWorking(true);
      const next = !msg.read;
      await updateDoc(doc(db, "messages", id), { read: next });
      setMsg({ ...msg, read: next });
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm("هل أنت متأكد من حذف هذه الرسالة؟");
    if (!ok) return;
    try {
      setWorking(true);
      await deleteDoc(doc(db, "messages", id));
      navigate("/admin/messages", { replace: true });
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="message-detail">
        <div className="card">
          جاري التحميل…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-detail">
        <div className="card" style={{ color: "#b91c1c" }}>
          حدث خطأ: {error}
        </div>
        <div className="md-actions">
          <Link className="btn" to="/admin/messages">
            <FaArrowRight /> الرجوع للرسائل
          </Link>
        </div>
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="message-detail">
        <div className="card">لا توجد بيانات للرسالة.</div>
        <div className="md-actions">
          <Link className="btn" to="/admin/messages">
            <FaArrowRight /> الرجوع للرسائل
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="message-detail">
      {/* روابط سريعة */}
      <div className="md-topbar">
        <Link className="btn" to="/admin/dashboard">
          <FaArrowRight /> العودة للداشبورد
        </Link>
        <Link className="btn" to="/admin/messages">
          <FaArrowRight /> العودة للرسائل
        </Link>
        {msg.read ? (
          <span className="badge read">مقروء</span>
        ) : (
          <span className="badge unread">غير مقروء</span>
        )}
      </div>

      {/* العنوان */}
      <h2 className="md-title">تفاصيل الرسالة</h2>

      {/* معلومات أساسية */}
      <div className="card_message">
        <div className="card-grid">
          <div className="card-row">
            <strong>الاسم:</strong> {msg.name}
          </div>

          <div className="card-row">
            <strong>الهاتف:</strong>
            {msg.phone ? (
              <>
                <a href={telHref}>{msg.phone}</a>
                <span className="contact-links">
                  <a href={waHref} target="_blank" rel="noreferrer">
                    واتساب
                  </a>
                </span>
              </>
            ) : (
              "—"
            )}
          </div>

          <div className="card-row">
            <strong>التاريخ:</strong> {formatTime(msg.createdAt)}
          </div>

          <div className="card-row">
            <strong>الحالة:</strong>
            {msg.read ? (
              <span className="badge read">مقروء</span>
            ) : (
              <span className="badge unread">غير مقروء</span>
            )}
          </div>
        </div>
      </div>

      {/* نص الرسالة */}
      <div className="card_message">
        <strong>نص الرسالة:</strong>
        <p className="msg-text">{msg.message || "—"}</p>
      </div>

      {/* الإجراءات */}
      <div className="md-actions">
        <button className="btn" onClick={toggleRead} disabled={working}>
          {msg.read ? (
            <>
              <FaEnvelope /> تعليم كغير مقروء
            </>
          ) : (
            <>
              <FaEnvelopeOpen /> تعليم كمقروء
            </>
          )}
        </button>

        <button className="btn danger" onClick={handleDelete} disabled={working}>
          <FaTrash /> حذف
        </button>
      </div>
    </div>
  );
};

export default MessageDetail;
