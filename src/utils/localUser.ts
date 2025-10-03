const STORAGE_KEY = "app-local-uid";

export function getLocalUid(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  let uid = window.localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      uid = crypto.randomUUID();
    } else {
      uid = Math.random().toString(36).slice(2);
    }
    window.localStorage.setItem(STORAGE_KEY, uid);
  }

  return uid;
}