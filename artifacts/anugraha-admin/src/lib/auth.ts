const storageKey = "anugraha_admin_auth";

export function isAdminAuthed() {
  try {
    const hasFlag = sessionStorage.getItem(storageKey) === "1";
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("anugraha_token");
    return hasFlag && hasToken;
  } catch {
    return false;
  }
}

export function markAdminAuthed() {
  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* ignore */
  }
}

export function clearAdminAuthed() {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}