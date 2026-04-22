import helmet from "helmet";

export const securityHeaders = helmet({
  // Bloqueia scripts não autorizados
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://cdn.staticfile.org",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Bootstrap precisa, usar hash futuro
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
      ],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : [],
    },
  },
  // Impede que o site seja embutido em um iframe (clickjacking)
  frameguard: {
    action: "deny",
  },
  // Remove header X-Powered-By
  hidePoweredBy: true,
  // Força HTTPS em produção
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  // Impede sniffing de tipo MIME
  noSniff: true,
  // Ativa proteção XSS do navegador
  xssFilter: true,
  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
});
