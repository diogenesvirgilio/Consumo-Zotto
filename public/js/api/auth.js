import { BASE_URL } from "./config.js";
import {
  getRefreshToken,
  setAccessToken,
  clearStorage,
  setRefreshToken,
} from "../utils/storage.js";
import { fetchWithAuth } from "./authRefresh.js";

export async function login(email, senha) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();

  if (response.ok) {
    setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data;
  }
  throw data;
}

export async function refreshToken() {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  });

  const data = await response.json();

  if (response.ok) {
    if (data.accessToken) setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data.accessToken;
  }

  clearStorage();
  window.location.href = "/pages/login.html";
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
