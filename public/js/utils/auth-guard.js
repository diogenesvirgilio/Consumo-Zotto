import { getAccessToken } from "./storage.js";
import { getUserFromToken } from "./auth.js";

export function requireAuth(allowedRoles = []) {
  const token = getAccessToken();
  if (!token) {
    window.location.href = "/pages/login.html";
    return false;
  }

  const user = getUserFromToken();
  if (!user) {
    window.location.href = "/pages/login.html";
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    window.location.href = "/pages/acesso-negado.html";
    return false;
  }

  return true;
}
