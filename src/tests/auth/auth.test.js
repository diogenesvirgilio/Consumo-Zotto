import request from "supertest";
import app from "../../server.js";
import pool from "../../database/db.js";

describe("Auth routes", () => {
  it("POST /auth/login - should return accessToken and set refresh token cookie", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nina@ymail.com", senha: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("refreshToken=");
  });

  it("POST /auth/refresh - should refresh accessToken using refresh token cookie", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "nina@ymail.com", senha: "123456" });

    const cookies = loginRes.headers["set-cookie"];

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .set("Cookie", cookies);

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
    expect(refreshRes.headers["set-cookie"]).toBeDefined();
    expect(refreshRes.headers["set-cookie"][0]).toContain("refreshToken=");
  });
});

afterAll(async () => {
  await pool.end();
}, 30000);
