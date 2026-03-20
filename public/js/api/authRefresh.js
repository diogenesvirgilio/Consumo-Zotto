import { BASE_URL } from "../api/config.js";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearStorage,
} from "../services/storage.js";
import { showModalSistema } from "../services/modalService.js";

// Flag para evitar múltiplas tentativas simultâneas de refresh
let isRefreshing = false;
let refreshPromise = null;

async function silentRefresh() {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("Refresh token ausente");
      }

      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }
        return data.accessToken;
      } else {
        throw new Error("Falha no refresh");
      }
    } catch (error) {
      clearStorage();
      // Redirecionar para login sem mostrar modal (já será feito pelo auth guard)
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

  let response = await fetch(url, options);

  if (response.status === 401) {
    try {
      // Tenta refresh silencioso
      const newAccessToken = await silentRefresh();
      options.headers["Authorization"] = `Bearer ${newAccessToken}`;
      // Retenta a requisição com novo token
      response = await fetch(url, options);
    } catch (error) {
      // Se refresh falhou, o usuário será redirecionado para login
      throw error;
    }
  }
  return response;
}
