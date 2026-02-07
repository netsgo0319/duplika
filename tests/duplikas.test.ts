import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import { setupAuth } from "../server/auth";
import authRoutes from "../server/routes/auth";
import duplikasRoutes from "../server/routes/duplikas";
import publicRoutes from "../server/routes/public";

function createApp() {
  const app = express();
  app.use(express.json());
  setupAuth(app);
  app.use("/api/auth", authRoutes);
  app.use("/api/duplikas", duplikasRoutes);
  app.use("/api/public", publicRoutes);
  return app;
}

describe("Duplika CRUD API", () => {
  let app: express.Express;
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    app = createApp();
    agent = request.agent(app);
    // Register and login
    await agent
      .post("/api/auth/register")
      .send({ username: "duplikaowner", password: "pass123" });
  });

  describe("POST /api/duplikas", () => {
    it("should create a duplika", async () => {
      const res = await agent
        .post("/api/duplikas")
        .send({
          displayName: "Test Duplika",
          handle: "test-duplika",
          bio: "Test bio",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.displayName).toBe("Test Duplika");
      expect(res.body.handle).toBe("test-duplika");
      expect(res.body.bio).toBe("Test bio");
      expect(res.body.isPublic).toBe(true);
    });

    it("should reject duplicate handle", async () => {
      const res = await agent
        .post("/api/duplikas")
        .send({
          displayName: "Another",
          handle: "test-duplika",
        });

      expect(res.status).toBe(409);
    });

    it("should reject missing displayName", async () => {
      const res = await agent
        .post("/api/duplikas")
        .send({ handle: "no-name" });

      expect(res.status).toBe(400);
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/duplikas")
        .send({
          displayName: "Unauth",
          handle: "unauth",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/duplikas", () => {
    it("should list current user's duplikas", async () => {
      const res = await agent.get("/api/duplikas");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].displayName).toBe("Test Duplika");
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/duplikas");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/duplikas/popular", () => {
    it("should list public duplikas", async () => {
      const res = await request(app).get("/api/duplikas/popular");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("conversationCount");
    });
  });

  describe("GET /api/duplikas/:id", () => {
    it("should get duplika by ID", async () => {
      // First, get list to find ID
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await request(app).get(`/api/duplikas/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.displayName).toBe("Test Duplika");
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(app).get("/api/duplikas/non-existent-id");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/duplikas/:id", () => {
    it("should update duplika", async () => {
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await agent
        .put(`/api/duplikas/${id}`)
        .send({ displayName: "Updated Duplika", bio: "Updated bio" });

      expect(res.status).toBe(200);
      expect(res.body.displayName).toBe("Updated Duplika");
      expect(res.body.bio).toBe("Updated bio");
      expect(res.body.handle).toBe("test-duplika"); // unchanged
    });

    it("should return 404 for non-existent duplika", async () => {
      const res = await agent
        .put("/api/duplikas/non-existent-id")
        .send({ displayName: "Nope" });

      expect(res.status).toBe(404);
    });

    it("should reject update from non-owner", async () => {
      // Create another user
      const otherAgent = request.agent(app);
      await otherAgent
        .post("/api/auth/register")
        .send({ username: "otheruser", password: "pass123" });

      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await otherAgent
        .put(`/api/duplikas/${id}`)
        .send({ displayName: "Hacked" });

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/duplikas/:id/visibility", () => {
    it("should toggle visibility", async () => {
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await agent
        .put(`/api/duplikas/${id}/visibility`)
        .send({ isPublic: false });

      expect(res.status).toBe(200);
      expect(res.body.isPublic).toBe(false);
    });

    it("should reject invalid input", async () => {
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await agent
        .put(`/api/duplikas/${id}/visibility`)
        .send({ isPublic: "not-a-boolean" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/public/profiles/:handle", () => {
    it("should get public profile by handle", async () => {
      // First make it public again
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;
      await agent
        .put(`/api/duplikas/${id}/visibility`)
        .send({ isPublic: true });

      const res = await request(app).get("/api/public/profiles/test-duplika");

      expect(res.status).toBe(200);
      expect(res.body.handle).toBe("test-duplika");
    });

    it("should return 404 for non-public profile", async () => {
      // Make private
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;
      await agent
        .put(`/api/duplikas/${id}/visibility`)
        .send({ isPublic: false });

      const res = await request(app).get("/api/public/profiles/test-duplika");
      expect(res.status).toBe(404);

      // Restore to public for other tests
      await agent
        .put(`/api/duplikas/${id}/visibility`)
        .send({ isPublic: true });
    });

    it("should return 404 for non-existent handle", async () => {
      const res = await request(app).get("/api/public/profiles/nonexistent");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/duplikas/:id/stats", () => {
    it("should get duplika statistics", async () => {
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await request(app).get(`/api/duplikas/${id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("factsCount");
      expect(res.body).toHaveProperty("qaCount");
      expect(res.body).toHaveProperty("topicsCount");
      expect(res.body).toHaveProperty("linksCount");
      expect(res.body).toHaveProperty("keywordsCount");
      expect(res.body).toHaveProperty("conversationCount");
    });
  });

  describe("GET /api/duplikas/:id/conversations", () => {
    it("should list conversations for owner", async () => {
      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await agent.get(`/api/duplikas/${id}/conversations`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should reject non-owner", async () => {
      const otherAgent = request.agent(app);
      await otherAgent
        .post("/api/auth/register")
        .send({ username: "convuser", password: "pass123" });

      const list = await agent.get("/api/duplikas");
      const id = list.body[0].id;

      const res = await otherAgent.get(`/api/duplikas/${id}/conversations`);
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/duplikas/:id", () => {
    it("should delete duplika and sub-resources", async () => {
      // Create a duplika to delete
      const createRes = await agent
        .post("/api/duplikas")
        .send({
          displayName: "To Delete",
          handle: "to-delete",
        });
      const id = createRes.body.id;

      // Add a sub-resource
      await agent
        .post(`/api/duplikas/${id}/facts`)
        .send({ text: "Will be deleted" });

      // Delete it
      const deleteRes = await agent.delete(`/api/duplikas/${id}`);
      expect(deleteRes.status).toBe(200);

      // Verify it's gone
      const getRes = await request(app).get(`/api/duplikas/${id}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 for non-existent duplika", async () => {
      const res = await agent.delete("/api/duplikas/non-existent-id");
      expect(res.status).toBe(404);
    });
  });
});
