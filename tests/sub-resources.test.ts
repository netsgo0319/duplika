import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import { setupAuth } from "../server/auth";
import authRoutes from "../server/routes/auth";
import duplikasRoutes from "../server/routes/duplikas";

function createApp() {
  const app = express();
  app.use(express.json());
  setupAuth(app);
  app.use("/api/auth", authRoutes);
  app.use("/api/duplikas", duplikasRoutes);
  return app;
}

describe("Sub-resource APIs", () => {
  let app: express.Express;
  let agent: ReturnType<typeof request.agent>;
  let duplikaId: string;

  beforeAll(async () => {
    app = createApp();
    agent = request.agent(app);

    // Register user
    await agent
      .post("/api/auth/register")
      .send({ username: "subresowner", password: "pass123" });

    // Create a duplika
    const res = await agent
      .post("/api/duplikas")
      .send({
        displayName: "Sub-Resource Test",
        handle: "sub-resource-test",
      });
    duplikaId = res.body.id;
  });

  // ═══════════════════════════════════════════════════════════════
  // FACTS
  // ═══════════════════════════════════════════════════════════════
  describe("Facts CRUD", () => {
    let factId: string;

    it("POST /api/duplikas/:id/facts — should add a fact", async () => {
      const res = await agent
        .post(`/api/duplikas/${duplikaId}/facts`)
        .send({ text: "I love programming", order: 1 });

      expect(res.status).toBe(201);
      expect(res.body.text).toBe("I love programming");
      expect(res.body.order).toBe(1);
      expect(res.body.duplikaId).toBe(duplikaId);
      factId = res.body.id;
    });

    it("GET /api/duplikas/:id/facts — should list facts", async () => {
      const res = await request(app).get(`/api/duplikas/${duplikaId}/facts`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].text).toBe("I love programming");
    });

    it("PUT /api/duplikas/:id/facts/:factId — should update a fact", async () => {
      const res = await agent
        .put(`/api/duplikas/${duplikaId}/facts/${factId}`)
        .send({ text: "I love TypeScript" });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe("I love TypeScript");
    });

    it("PUT — should return 404 for non-existent fact", async () => {
      const res = await agent
        .put(`/api/duplikas/${duplikaId}/facts/nonexistent`)
        .send({ text: "Nope" });

      expect(res.status).toBe(404);
    });

    it("DELETE /api/duplikas/:id/facts/:factId — should delete a fact", async () => {
      const res = await agent.delete(`/api/duplikas/${duplikaId}/facts/${factId}`);
      expect(res.status).toBe(200);

      // Verify it's gone
      const list = await request(app).get(`/api/duplikas/${duplikaId}/facts`);
      expect(list.body.length).toBe(0);
    });

    it("GET — should return 404 for non-existent duplika", async () => {
      const res = await request(app).get("/api/duplikas/nonexistent/facts");
      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Q&A PAIRS
  // ═══════════════════════════════════════════════════════════════
  describe("Q&A CRUD", () => {
    let qaId: string;

    it("POST /api/duplikas/:id/qa — should add a Q&A pair", async () => {
      const res = await agent
        .post(`/api/duplikas/${duplikaId}/qa`)
        .send({ question: "What is your name?", answer: "My name is Test" });

      expect(res.status).toBe(201);
      expect(res.body.question).toBe("What is your name?");
      expect(res.body.answer).toBe("My name is Test");
      qaId = res.body.id;
    });

    it("GET /api/duplikas/:id/qa — should list Q&A pairs", async () => {
      const res = await request(app).get(`/api/duplikas/${duplikaId}/qa`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].question).toBe("What is your name?");
    });

    it("PUT /api/duplikas/:id/qa/:qaId — should update a Q&A pair", async () => {
      const res = await agent
        .put(`/api/duplikas/${duplikaId}/qa/${qaId}`)
        .send({ answer: "Updated answer" });

      expect(res.status).toBe(200);
      expect(res.body.answer).toBe("Updated answer");
      expect(res.body.question).toBe("What is your name?"); // unchanged
    });

    it("DELETE /api/duplikas/:id/qa/:qaId — should delete a Q&A pair", async () => {
      const res = await agent.delete(`/api/duplikas/${duplikaId}/qa/${qaId}`);
      expect(res.status).toBe(200);

      const list = await request(app).get(`/api/duplikas/${duplikaId}/qa`);
      expect(list.body.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TOPICS TO AVOID
  // ═══════════════════════════════════════════════════════════════
  describe("Topics to Avoid CRUD", () => {
    let topicId: string;

    it("POST /api/duplikas/:id/topics-to-avoid — should add a topic", async () => {
      const res = await agent
        .post(`/api/duplikas/${duplikaId}/topics-to-avoid`)
        .send({ topic: "Politics" });

      expect(res.status).toBe(201);
      expect(res.body.topic).toBe("Politics");
      topicId = res.body.id;
    });

    it("GET /api/duplikas/:id/topics-to-avoid — should list topics", async () => {
      const res = await request(app).get(`/api/duplikas/${duplikaId}/topics-to-avoid`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].topic).toBe("Politics");
    });

    it("DELETE /api/duplikas/:id/topics-to-avoid/:topicId — should delete a topic", async () => {
      const res = await agent.delete(`/api/duplikas/${duplikaId}/topics-to-avoid/${topicId}`);
      expect(res.status).toBe(200);

      const list = await request(app).get(`/api/duplikas/${duplikaId}/topics-to-avoid`);
      expect(list.body.length).toBe(0);
    });

    it("DELETE — should return 404 for non-existent topic", async () => {
      const res = await agent.delete(`/api/duplikas/${duplikaId}/topics-to-avoid/nonexistent`);
      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SHAREABLE LINKS
  // ═══════════════════════════════════════════════════════════════
  describe("Shareable Links CRUD", () => {
    let linkId: string;

    it("POST /api/duplikas/:id/shareable-links — should add a link", async () => {
      const res = await agent
        .post(`/api/duplikas/${duplikaId}/shareable-links`)
        .send({ title: "YouTube", url: "https://youtube.com/@test", type: "youtube" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("YouTube");
      expect(res.body.url).toBe("https://youtube.com/@test");
      expect(res.body.type).toBe("youtube");
      linkId = res.body.id;
    });

    it("GET /api/duplikas/:id/shareable-links — should list links", async () => {
      const res = await request(app).get(`/api/duplikas/${duplikaId}/shareable-links`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("YouTube");
    });

    it("DELETE /api/duplikas/:id/shareable-links/:linkId — should delete a link", async () => {
      const res = await agent.delete(`/api/duplikas/${duplikaId}/shareable-links/${linkId}`);
      expect(res.status).toBe(200);

      const list = await request(app).get(`/api/duplikas/${duplikaId}/shareable-links`);
      expect(list.body.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // KEYWORD RESPONSES
  // ═══════════════════════════════════════════════════════════════
  describe("Keyword Responses CRUD", () => {
    let resId: string;

    it("POST /api/duplikas/:id/keyword-responses — should add a keyword response", async () => {
      const res = await agent
        .post(`/api/duplikas/${duplikaId}/keyword-responses`)
        .send({ keywords: "hello, hi", response: "Hey there! Nice to meet you." });

      expect(res.status).toBe(201);
      expect(res.body.keywords).toBe("hello, hi");
      expect(res.body.response).toBe("Hey there! Nice to meet you.");
      resId = res.body.id;
    });

    it("GET /api/duplikas/:id/keyword-responses — should list keyword responses", async () => {
      const res = await request(app).get(`/api/duplikas/${duplikaId}/keyword-responses`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].keywords).toBe("hello, hi");
    });

    it("PUT /api/duplikas/:id/keyword-responses/:resId — should update a keyword response", async () => {
      const res = await agent
        .put(`/api/duplikas/${duplikaId}/keyword-responses/${resId}`)
        .send({ response: "Updated greeting!" });

      expect(res.status).toBe(200);
      expect(res.body.response).toBe("Updated greeting!");
      expect(res.body.keywords).toBe("hello, hi"); // unchanged
    });

    it("DELETE /api/duplikas/:id/keyword-responses/:resId — should delete a keyword response", async () => {
      const res = await agent.delete(`/api/duplikas/${duplikaId}/keyword-responses/${resId}`);
      expect(res.status).toBe(200);

      const list = await request(app).get(`/api/duplikas/${duplikaId}/keyword-responses`);
      expect(list.body.length).toBe(0);
    });

    it("PUT — should return 404 for non-existent keyword response", async () => {
      const res = await agent
        .put(`/api/duplikas/${duplikaId}/keyword-responses/nonexistent`)
        .send({ response: "Nope" });

      expect(res.status).toBe(404);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AUTH CHECKS for sub-resources
  // ═══════════════════════════════════════════════════════════════
  describe("Auth checks", () => {
    it("should reject unauthenticated POST to facts", async () => {
      const res = await request(app)
        .post(`/api/duplikas/${duplikaId}/facts`)
        .send({ text: "Unauth fact" });
      expect(res.status).toBe(401);
    });

    it("should reject non-owner POST to facts", async () => {
      const otherAgent = request.agent(app);
      await otherAgent
        .post("/api/auth/register")
        .send({ username: "subresother", password: "pass123" });

      const res = await otherAgent
        .post(`/api/duplikas/${duplikaId}/facts`)
        .send({ text: "Not my duplika" });
      expect(res.status).toBe(403);
    });
  });
});
