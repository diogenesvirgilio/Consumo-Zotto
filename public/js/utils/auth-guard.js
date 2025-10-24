import { getAccessToken } from "./storage.js";
import { getUserFromToken } from "./auth.js";

export async function requireAuth(allowedRoles = []) {
  const token = getAccessToken();
  if (!token) {
    window.location.href = "/pages/login.html";
    return false;
  }

  const user = getUserFromToken();
  if (!user) {
    try {
      const { refreshToken } = await import("../api/auth.js");
      await refreshToken();

      const refreshedUser = getUserFromToken();
      if (!refreshedUser) {
        window.location.href = "/pages/acesso-negado.html";
        return false;
      }
      return true;
    } catch (err) {
      console.error("[Auth Guard] Erro no refresh:", err);
      window.location.href = "/pages/login.html";
      return false;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    window.location.href = "/pages/acesso-negado.html";
    return false;
  }

  return true;
}
