import { getAccessToken } from "./storage.js";

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function requireAuth() {
  const token = getAccessToken();
  if (!token) {
    window.location.href = "/pages/login.html";
  }
}
