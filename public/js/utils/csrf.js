import { BASE_URL } from "../api/config.js";
import { getAccessToken } from "../services/storage.js";

let cachedToken = null;

export async function getCsrfToken() {
  if (cachedToken) return cachedToken;

  try {
    const accessToken = getAccessToken();
    const response = await fetch(`${BASE_URL}/api/csrf-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      cachedToken = data.csrfToken;
      return cachedToken;
    }
  } catch (error) {
    console.error("Erro ao obter CSRF token:", error);
  }

  return null;
}

export function invalidateCsrfToken() {
  cachedToken = null;
}
