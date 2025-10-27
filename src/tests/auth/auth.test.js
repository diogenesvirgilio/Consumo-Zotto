import request from "supertest";
import app from "../../server.js";
import pool from "../../database/db.js";

describe("Auth routes", () => {
  it("POST /auth/login - should return accessToken and refreshToken for valid", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nina@ymail.com", senha: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("POST /auth/refresh - should refresh accessToken using refreshToken", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "nina@ymail.com", senha: "123456" });

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
  });
});

afterAll(async () => {
  await pool.end();
}, 30000);
