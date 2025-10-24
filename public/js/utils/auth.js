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

    // Permite um de 30 segundos antes da expiração
    const bufferTime = 30 * 1000; // 30 segundos
    if (payload.exp * 1000 < Date.now() + bufferTime) {
      import("../api/auth.js").then((auth) => {
        auth.refreshToken().catch((err) => {
          return null;
        });
      });
    }

    return payload;
  } catch (e) {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "login.html";
}
