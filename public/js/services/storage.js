export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token) {
  localStorage.setItem("accessToken", token);
}

export function clearStorage() {
  localStorage.clear();
}

export function getRefreshToken() {
  console.warn("getRefreshToken() é deprecated - use cookie HTTP-only");
  return null;
}

export function setRefreshToken() {
  console.warn(
    "setRefreshToken() é deprecated - cookie é gerenciado pelo servidor",
  );
}
