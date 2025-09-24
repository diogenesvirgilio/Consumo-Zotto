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