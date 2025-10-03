
// src/pages/Admin/MessagesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { FaTrash, FaEnvelopeOpen, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth, db } from "../../Models/firebase";
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
import { onAuthStateChanged } from "firebase/auth";

import { makeTelHref } from "../../utils/phone";
import "./messages.css";

type Message = {
  id: string;
  name: string;
  phone: string;
  text: string;
  createdAt?: Timestamp | null;
  readBy: Record<string, boolean>;
  deletedFor: Record<string, boolean>;
  senderId?: string;
  recipients?: string[];
};

const PREFERRED_ISO = "KW";

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [working, setWorking] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setLoadingInitial(true);
    setError(null);

    const qRef = query(collection(db, "messages"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      qRef,
      (snapshot) => {
        const list: Message[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          const readBy = data?.readBy && typeof data.readBy === "object" ? data.readBy : {};
          const deletedFor = data?.deletedFor && typeof data.deletedFor === "object" ? data.deletedFor : {};
          return {
            id: docSnap.id,
            name: data?.name || "زائر",
            phone: data?.phone || "غير معروف",
            text: data?.text || data?.message || "",
            createdAt: data?.createdAt || null,
            readBy,
            deletedFor,
            senderId: data?.senderId || null,
            recipients: Array.isArray(data?.recipients) ? data.recipients : [],
          };
        });
        list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setMessages(list);
        setLoadingInitial(false);
      },
      (err) => {
        console.error("[Firestore:onSnapshot] error:", err);
        setError(humanizeFirestoreError(err));
        setLoadingInitial(false);
      }
    );

    return () => unsub();
  }, []);

  const visibleMessages = useMemo(() => {
    if (!currentUid) return messages;
    return messages.filter((msg) => !msg.deletedFor?.[currentUid]);
  }, [messages, currentUid]);

  const displayed = useMemo(() => {
    if (!onlyUnread || !currentUid) return visibleMessages;
    return visibleMessages.filter((msg) => !msg.readBy?.[currentUid]);
  }, [visibleMessages, onlyUnread, currentUid]);

  const allVisibleSelected =
    displayed.length > 0 && displayed.every((msg) => selected.has(msg.id));
  const someVisibleSelected =
    displayed.some((msg) => selected.has(msg.id)) && !allVisibleSelected;

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
        displayed.forEach((msg) => next.delete(msg.id));
      } else {
        displayed.forEach((msg) => next.add(msg.id));
      }
      return next;
    });
  };

  const markAsRead = async (ids: string[]) => {
    if (!currentUid || ids.length === 0) return;
    setWorking(true);
    try {
      await Promise.all(
        ids.map((id) => updateDoc(doc(db, "messages", id), { [`readBy.${currentUid}`]: true }))
      );
    } catch (err) {
      console.error("Update read state error:", err);
      alert("تعذر تحديث حالة الرسالة. راجع وحدة التحكم للمزيد من التفاصيل.");
    } finally {
      setWorking(false);
    }
  };

  const hideForMe = async (ids: string[]) => {
    if (!currentUid || ids.length === 0) return;
    setWorking(true);
    try {
      await Promise.all(
        ids.map((id) => updateDoc(doc(db, "messages", id), { [`deletedFor.${currentUid}`]: true }))
      );
    } catch (err) {
      console.error("Soft delete error:", err);
      alert("تعذر إخفاء الرسائل. راجع وحدة التحكم للمزيد من التفاصيل.");
    } finally {
      setWorking(false);
    }
  };

  const confirmHide = async (ids: string[]) => {
    if (!ids.length || !currentUid) return;
    const ok = window.confirm(
      ids.length === 1
        ? "هل تريد إخفاء هذه الرسالة لك فقط؟"
        : `هل تريد إخفاء ${ids.length} رسالة لك فقط؟`
    );
    if (!ok) return;

    await hideForMe(ids);
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const hardDelete = async (ids: string[]) => {
    if (!ids.length) return;
    const ok = window.confirm(
      ids.length === 1
        ? "هل تريد حذف هذه الرسالة نهائيًا؟"
        : `هل تريد حذف ${ids.length} رسالة نهائيًا؟`
    );
    if (!ok) return;

    setWorking(true);
    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "messages", id))));
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err) {
      console.error("Hard delete error:", err);
      alert("تعذر تنفيذ الحذف النهائي. راجع وحدة التحكم للمزيد من التفاصيل.");
    } finally {
      setWorking(false);
    }
  };

  const formatDate = (ts?: Timestamp | null) => {
    if (!ts?.toDate) return "غير متوفر";
    const date = ts.toDate();
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const selectedIds = useMemo(
    () => Array.from(selected).filter((id) => displayed.some((msg) => msg.id === id)),
    [selected, displayed]
  );

  const unreadCount = useMemo(() => {
    if (!currentUid) return visibleMessages.length;
    return visibleMessages.filter((msg) => !msg.readBy?.[currentUid]).length;
  }, [visibleMessages, currentUid]);

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h2>
          صندوق رسائل العملاء{" "}
          <span className="badge">{unreadCount} رسالة غير مقروءة</span>
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
            disabled={selectedIds.length === 0 || working || !currentUid}
            onClick={() => markAsRead(selectedIds)}
            title="تعيين الرسائل كمقروءة"
          >
            تعليم كمقروء
          </button>
          <button
            className="danger"
            disabled={selectedIds.length === 0 || working || !currentUid}
            onClick={() => confirmHide(selectedIds)}
            title="إخفاء الرسائل لك فقط"
          >
            إخفاء للمدير
          </button>
          <button
            className="danger outline"
            disabled={selectedIds.length === 0 || working}
            onClick={() => hardDelete(selectedIds)}
            title="حذف نهائي للرسائل"
          >
            حذف نهائي
          </button>
        </div>
      </div>

      {loadingInitial && (
        <div className="empty info">... يتم تحميل الرسائل من قاعدة البيانات</div>
      )}
      {error && <div className="empty error">{error}</div>}

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
              <th>الهاتف</th>
              <th>الرسالة</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th className="col-actions">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {!loadingInitial && displayed.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  لا توجد رسائل لعرضها حاليًا.
                </td>
              </tr>
            ) : (
              displayed.map((msg) => {
                const isRead = currentUid ? !!msg.readBy?.[currentUid] : false;
                return (
                  <tr key={msg.id} className={!isRead ? "unread" : ""}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        checked={selected.has(msg.id)}
                        onChange={() => toggleSelect(msg.id)}
                      />
                    </td>
                    <td>{msg.name}</td>
                    <td>
                      {msg.phone && msg.phone !== "غير معروف" ? (
                        <a href={makeTelHref(msg.phone, PREFERRED_ISO)}>{msg.phone}</a>
                      ) : (
                        "غير متوفر"
                      )}
                    </td>
                    <td className="msg-text">{msg.text}</td>
                    <td>{formatDate(msg.createdAt)}</td>
                    <td>
                      {isRead ? (
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
                        عرض
                      </Link>

                      {!isRead && currentUid && (
                        <button
                          onClick={() => markAsRead([msg.id])}
                          disabled={working}
                          title="تعيين كمقروء"
                          className="icon-btn"
                        >
                          <FaEnvelopeOpen />
                        </button>
                      )}

                      <button
                        className="icon-btn"
                        onClick={() => confirmHide([msg.id])}
                        disabled={working || !currentUid}
                        title="إخفاء الرسالة لي فقط"
                      >
                        <FaEnvelope />
                      </button>

                      <button
                        className="danger icon-btn"
                        onClick={() => hardDelete([msg.id])}
                        disabled={working}
                        title="حذف نهائي"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {working && <div className="working-overlay">... يتم تنفيذ العملية</div>}
    </div>
  );
};

export default MessagesPage;

function humanizeFirestoreError(err: any): string {
  const code = err?.code || "";
  if (code === "permission-denied") {
    return "لا تملك صلاحية الوصول إلى هذه الرسائل. تحقق من إعدادات Firestore.";
  }
  if (code === "failed-precondition") {
    return "هناك مؤشر (Index) مفقود. راجع لوحة تحكم Firebase.";
  }
  if (code === "unavailable") {
    return "خدمة Firestore غير متاحة مؤقتًا. حاول مرة أخرى لاحقًا.";
  }
  return err?.message || "حدث خطأ غير متوقع أثناء جلب الرسائل.";
}
