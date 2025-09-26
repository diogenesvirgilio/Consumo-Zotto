import { BASE_URL } from "../api/config.js";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearStorage,
} from "../utils/storage.js";
import { showModalSistema } from "../utils/modalService.js";

export async function fetchWithAuth(url, options = {}) {
  let accessToken = getAccessToken();
  options.headers = options.headers || {};
  options.headers["Authorization"] = `Bearer ${accessToken}`;

  let response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    const refreshToken = getRefreshToken();
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      setAccessToken(data.accessToken);
      options.headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(url, options);
    } else {
      clearStorage();
      showModalSistema({
        titulo: "Sessão expirada",
        conteudo: "Por favor, faça o login novamente.",
      });
      throw new Error("Sessão expirada");
    }
  }
  return response;
}
