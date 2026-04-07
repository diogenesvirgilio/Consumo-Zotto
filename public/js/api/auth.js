import { BASE_URL } from "./config.js";
import { setAccessToken, clearStorage } from "../services/storage.js";
import { fetchWithAuth } from "./authRefresh.js";

export async function login(email, senha) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();

  if (response.ok) {
    setAccessToken(data.accessToken);
    return data;
  }
  throw data;
}

export async function refreshToken() {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.accessToken) setAccessToken(data.accessToken);
      return data.accessToken;
    } else {
      clearStorage();
      window.location.href = "/pages/login.html";
      throw new Error(data.error || "Falha ao renovar token");
    }
  } catch (error) {
    clearStorage();
    window.location.href = "/pages/login.html";
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });

    return await response.json();
  } finally {
    clearStorage();
  }
}
