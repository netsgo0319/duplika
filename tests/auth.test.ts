import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import { setupAuth } from "../server/auth";
import authRoutes from "../server/routes/auth";

function createApp() {
  const app = express();
  app.use(express.json());
  setupAuth(app);
  app.use("/api/auth", authRoutes);
  return app;
}

describe("Auth API", () => {
  let app: express.Express;

  beforeAll(() => {
    app = createApp();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "testpass123" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.username).toBe("testuser");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should reject duplicate username", async () => {
      // First registration
      await request(app)
        .post("/api/auth/register")
        .send({ username: "duplicate", password: "pass123" });

      // Second registration with same username
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "duplicate", password: "pass456" });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Username already exists");
    });

    it("should reject invalid input (missing password)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "nopass" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    let loginApp: express.Express;

    beforeAll(async () => {
      loginApp = createApp();
      // Register a user first
      await request(loginApp)
        .post("/api/auth/register")
        .send({ username: "loginuser", password: "loginpass123" });
    });

    it("should login with valid credentials", async () => {
      const res = await request(loginApp)
        .post("/api/auth/login")
        .send({ username: "loginuser", password: "loginpass123" });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("loginuser");
      expect(res.body).toHaveProperty("id");
    });

    it("should reject invalid password", async () => {
      const res = await request(loginApp)
        .post("/api/auth/login")
        .send({ username: "loginuser", password: "wrongpass" });

      expect(res.status).toBe(401);
    });

    it("should reject non-existent user", async () => {
      const res = await request(loginApp)
        .post("/api/auth/login")
        .send({ username: "nonexistent", password: "pass123" });

      expect(res.status).toBe(401);
    });
  });

  describe("Session flow: register -> me -> logout -> me", () => {
    let sessionApp: express.Express;
    let agent: ReturnType<typeof request.agent>;

    beforeAll(() => {
      sessionApp = createApp();
      agent = request.agent(sessionApp);
    });

    it("should maintain session after registration", async () => {
      // Register
      const registerRes = await agent
        .post("/api/auth/register")
        .send({ username: "sessionuser", password: "sessionpass123" });

      expect(registerRes.status).toBe(201);

      // Check session persists with /me
      const meRes = await agent.get("/api/auth/me");
      expect(meRes.status).toBe(200);
      expect(meRes.body.username).toBe("sessionuser");
    });

    it("should logout and lose session", async () => {
      // Logout
      const logoutRes = await agent.post("/api/auth/logout");
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe("Logged out");

      // /me should now be 401
      const meRes = await agent.get("/api/auth/me");
      expect(meRes.status).toBe(401);
    });

    it("should maintain session after login", async () => {
      // Login
      const loginRes = await agent
        .post("/api/auth/login")
        .send({ username: "sessionuser", password: "sessionpass123" });

      expect(loginRes.status).toBe(200);

      // /me should work
      const meRes = await agent.get("/api/auth/me");
      expect(meRes.status).toBe(200);
      expect(meRes.body.username).toBe("sessionuser");
    });
  });

  describe("GET /api/auth/me (unauthenticated)", () => {
    it("should return 401 when not logged in", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Authentication required");
    });
  });
});
