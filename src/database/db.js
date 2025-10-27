import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import path from "path";

// Carrega .env.test quando em ambiente de teste, caso exista
const envPath =
  process.env.NODE_ENV === "test"
    ? path.join(process.cwd(), ".env.test")
    : path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Pool com timeouts mais agressivos para ambiente de teste
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: parseInt(process.env.DB_MAX_CLIENTS || "5", 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "1000", 10),
  connectionTimeoutMillis: parseInt(
    process.env.DB_CONN_TIMEOUT_MS || "2000",
    10
  ),
});

// Testa conexão de forma não intrusiva (não mantém cliente aberto)
pool
  .query("SELECT 1")
  .then(() => {
    console.log("Conectado ao PostgreSQL com sucesso");
  })
  .catch((err) => {
    console.error("Erro ao conectar ao PostgreSQL:", err);
  });

export default pool;
