import { useEffect, useMemo, useState } from "react";
import { FaTrash, FaEnvelopeOpen, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { db } from "../../Models/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import "./messages.css";

type Message = {
  id: string;
  name: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt?: Timestamp | null;
};

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data?.name || "مستخدم",
          phone: data?.phone || "غير متوفر",
          message: data?.message || "",
          read: Boolean(data?.read),
          createdAt: data?.createdAt || null,
        };
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const displayed = useMemo(
    () => (onlyUnread ? messages.filter((m) => !m.read) : messages),
    [messages, onlyUnread]
  );

  const allVisibleSelected =
    displayed.length > 0 && displayed.every((m) => selected.has(m.id));
  const someVisibleSelected =
    displayed.some((m) => selected.has(m.id)) && !allVisibleSelected;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        // فك التحديد عن العناصر الظاهرة فقط
        displayed.forEach((m) => next.delete(m.id));
      } else {
        // حدّد العناصر الظاهرة فقط
        displayed.forEach((m) => next.add(m.id));
      }
      return next;
    });
  };

  const confirmDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    const ok = window.confirm(
      ids.length === 1
        ? "هل تريد حذف هذه الرسالة؟"
        : `هل تريد حذف ${ids.length} رسالة؟`
    );
    if (!ok) return;

    setWorking(true);
    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "messages", id))));
      // نظّف التحديد بعد الحذف
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } finally {
      setWorking(false);
    }
  };

  const markReadState = async (ids: string[], value: boolean) => {
    if (ids.length === 0) return;
    setWorking(true);
    try {
      await Promise.all(
        ids.map((id) => updateDoc(doc(db, "messages", id), { read: value }))
      );
    } finally {
      setWorking(false);
    }
  };

  const formatDate = (ts?: Timestamp | null) => {
    if (!ts?.toDate) return "—";
    const d = ts.toDate();
    // تنسيق بسيط عربي/24h
    return d.toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const selectedIds = Array.from(selected).filter((id) =>
    displayed.some((m) => m.id === id)
  );

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h2>
          📩 رسائل العملاء{" "}
          <span className="badge">
            {messages.filter((m) => !m.read).length} غير مقروء
          </span>
        </h2>

        <div className="actions">
          <label className="switch">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => setOnlyUnread(e.target.checked)}
            />
            <span>عرض غير المقروء فقط</span>
          </label>

          <button
            disabled={selectedIds.length === 0 || working}
            onClick={() => markReadState(selectedIds, true)}
            title="تعليم كمقروء"
          >
            تعليم كمقروء
          </button>
          <button
            disabled={selectedIds.length === 0 || working}
            onClick={() => markReadState(selectedIds, false)}
            title="تعليم كغير مقروء"
          >
            تعليم كغير مقروء
          </button>
          <button
            className="danger"
            disabled={selectedIds.length === 0 || working}
            onClick={() => confirmDelete(selectedIds)}
            title="حذف المحدد"
          >
            حذف المحدد
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="messages-table">
          <thead>
            <tr>
              <th className="col-check">
                <label className={someVisibleSelected ? "indeterminate" : ""}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    onChange={toggleSelectAllVisible}
                  />
                </label>
              </th>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>الرسالة</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th className="col-actions">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  لا توجد رسائل مطابقة
                </td>
              </tr>
            ) : (
              displayed.map((msg) => (
                <tr key={msg.id} className={!msg.read ? "unread" : ""}>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      checked={selected.has(msg.id)}
                      onChange={() => toggleSelect(msg.id)}
                    />
                  </td>
                  <td>{msg.name}</td>
                  <td>
                    <a href={`tel:${msg.phone.replace(/\s+/g, "")}`}>
                      {msg.phone}
                    </a>
                  </td>
                  <td className="msg-text">{msg.message}</td>
                  <td>{formatDate(msg.createdAt)}</td>
                  <td>
                    {msg.read ? (
                      <span className="status read">مقروء</span>
                    ) : (
                      <span className="status unread-badge">غير مقروء</span>
                    )}
                  </td>
                  <td className="col-actions">
                    <Link
                      to={`/admin/messages/${msg.id}`}
                      className="icon-btn"
                      title="عرض التفاصيل"
                    >
                      👁️ عرض
                    </Link>

                    {msg.read ? (
                      <button
                        onClick={() => markReadState([msg.id], false)}
                        disabled={working}
                        title="تعليم كغير مقروء"
                        className="icon-btn"
                      >
                        <FaEnvelope /> غير مقروء
                      </button>
                    ) : (
                      <button
                        onClick={() => markReadState([msg.id], true)}
                        disabled={working}
                        title="تعليم كمقروء"
                        className="icon-btn"
                      >
                        <FaEnvelopeOpen /> مقروء
                      </button>
                    )}
                    <button
                      className="danger icon-btn"
                      onClick={() => confirmDelete([msg.id])}
                      disabled={working}
                      title="حذف"
                    >
                      <FaTrash /> حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {working && <div className="working-overlay">... جاري تنفيذ العملية</div>}
    </div>
  );
};

export default MessagesPage;
