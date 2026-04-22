import { BASE_URL } from "../api/config.js";
import {
  getAccessToken,
  setAccessToken,
  clearStorage,
} from "../services/storage.js";
import { getCsrfToken, invalidateCsrfToken } from "../utils/csrf.js";

let isRefreshing = false;
let refreshPromise = null;

async function silentRefresh() {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
      } else {
        throw new Error("Falha no refresh");
      }
    } catch (error) {
      clearStorage();
      window.location.href = "/pages/login.html";
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(url, options = {}) {
  let accessToken = getAccessToken();
  options.headers = options.headers || {};
  options.headers["Authorization"] = `Bearer ${accessToken}`;
  options.credentials = "include";

  // Adicionar CSRF token para POST, PUT e DELETE
  if (["POST", "PUT", "DELETE"].includes(options.method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      options.headers["X-CSRF-TOKEN"] = csrfToken;
    }
  }

  let response = await fetch(url, options);

  // Tentar recuperar em caso de erro CSRF (403)
  if (response.status === 403 && ["POST", "PUT", "DELETE"].includes(options.method)) {
    // Token CSRF pode ter expirado, tenta novamente com novo token
    invalidateCsrfToken();
    const newCsrfToken = await getCsrfToken();
    if (newCsrfToken) {
      options.headers["X-CSRF-TOKEN"] = newCsrfToken;
      response = await fetch(url, options);
    }
  }

  if (response.status === 401) {
    try {
      const newAccessToken = await silentRefresh();
      options.headers["Authorization"] = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    } catch (error) {
      throw error;
    }
  }
  return response;
}
