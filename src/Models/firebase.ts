import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// إعدادات المشروع (من Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDapTp6_FmC0bikBxJnYrm0o_Pg-zpAOJw",
  authDomain: "fani-sihi.firebaseapp.com",
  projectId: "fani-sihi",
  storageBucket: "fani-sihi.appspot.com",
  messagingSenderId: "553767870118",
  appId: "1:553767870118:web:51a6ae6cdfcc09d8fdde67",
  measurementId: "G-6ZNX5SZ24F"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Firestore والمصادقة
const db = getFirestore(app);
const auth = getAuth(app);

// تصدير كل شيء للاستعمال في الملفات الأخرى
export { app, db, auth, collection, addDoc, serverTimestamp };
export default app;