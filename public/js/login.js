import { setAccessToken, setRefreshToken } from "./utils/storage.js";
import { BASE_URL } from "./api/config.js"; 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("usuario").value;
        const senha = document.getElementById("senha").value;

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, senha }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error || "Erro no login");
                return;
            }

            const data = await response.json();
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            window.location.href = "/pages/cadastrar-usuario.html";
        } catch (err) {
            alert("Não foi possível conectar ao servidor.");
        }
    });
});
