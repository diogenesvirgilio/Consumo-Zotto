export function initTokenRefreshWorker() {
  // Verifica a cada 20 segundos se o token precisa ser renovado
  setInterval(() => {
    const userFromToken = getUserFromToken();
    if (userFromToken && userFromToken.exp) {
      // Buffer de 30 segundos antes da expiração
      const bufferTime = 30 * 1000;
      const timeUntilExpiry = userFromToken.exp * 1000 - Date.now();
      
      if (timeUntilExpiry <= bufferTime && timeUntilExpiry > 0) {
        refreshTokenSilently();
      }
    }
  }, 20000); // 20 segundos
}

async function refreshTokenSilently() {
  try {
    import("../api/auth.js").then((auth) => {
      auth.refreshToken().catch(() => {
        // Erro será tratado pelo auth guard que redireciona para login
      });
    });
  } catch (error) {
    // Silencioso - o auth guard tratará
  }
}

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

    // Permite um buffer de 30 segundos antes da expiração
    const bufferTime = 30 * 1000; // 30 segundos
    if (payload.exp * 1000 < Date.now() + bufferTime) {
      refreshTokenSilently();
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
