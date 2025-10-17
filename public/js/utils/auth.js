export function getUserFromToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      return null;
    }

    const payload = JSON.parse(atob(payloadBase64));

    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch (e) {
    console.error("Erro ao decodificar token:", e);
    return null;
  }
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "login.html";
}
