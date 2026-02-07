import { describe, it, expect, beforeAll, vi } from "vitest";
import express from "express";
import request from "supertest";
import { setupAuth } from "../server/auth";
import authRoutes from "../server/routes/auth";
import chatRoutes from "../server/routes/chat";
import duplikasRoutes from "../server/routes/duplikas";

// Mock the RAG service to avoid real LLM/embedding calls
vi.mock("../server/services/rag", () => ({
  generateRagResponse: vi.fn().mockResolvedValue({
    text: "Hello! I'm your AI clone. How can I help?",
    sources: [
      {
        sourceType: "youtube",
        sourceUrl: "https://youtube.com/watch?v=test",
        similarity: 0.88,
      },
    ],
  }),
}));

function createApp() {
  const app = express();
  app.use(express.json());
  setupAuth(app);
  app.use("/api/auth", authRoutes);
  app.use("/api/duplikas", duplikasRoutes);
  app.use("/api/chat", chatRoutes);
  return app;
}

describe("Chat API", () => {
  let app: express.Express;
  let agent: ReturnType<typeof request.agent>;
  let duplikaId: string;

  beforeAll(async () => {
    app = createApp();
    agent = request.agent(app);

    // Register and login
    await agent
      .post("/api/auth/register")
      .send({ username: "chatuser", password: "chatpass123" });

    // Create a duplika
    const duplikaRes = await agent
      .post("/api/duplikas")
      .send({
        displayName: "Chat Bot",
        handle: "chatbot",
        bio: "A friendly test bot",
      });
    duplikaId = duplikaRes.body.id;
  });

  describe("POST /api/chat/:duplikaId/conversations", () => {
    it("creates a new conversation", async () => {
      const res = await agent
        .post(`/api/chat/${duplikaId}/conversations`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.duplikaId).toBe(duplikaId);
    });

    it("returns 404 for non-existent duplika", async () => {
      const res = await agent
        .post("/api/chat/nonexistent/conversations");

      expect(res.status).toBe(404);
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .post(`/api/chat/${duplikaId}/conversations`);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/chat/:duplikaId/conversations", () => {
    it("lists conversations for a duplika", async () => {
      // Create a conversation first
      await agent.post(`/api/chat/${duplikaId}/conversations`);

      const res = await agent
        .get(`/api/chat/${duplikaId}/conversations`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("returns 404 for non-existent duplika", async () => {
      const res = await agent
        .get("/api/chat/nonexistent/conversations");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/chat/conversations/:id/messages", () => {
    let conversationId: string;

    beforeAll(async () => {
      const convRes = await agent
        .post(`/api/chat/${duplikaId}/conversations`);
      conversationId = convRes.body.id;
    });

    it("sends a message and receives RAG response", async () => {
      const res = await agent
        .post(`/api/chat/conversations/${conversationId}/messages`)
        .send({ text: "Hello, tell me about yourself!" });

      expect(res.status).toBe(201);
      expect(res.body.userMessage).toBeDefined();
      expect(res.body.userMessage.text).toBe("Hello, tell me about yourself!");
      expect(res.body.userMessage.isUser).toBe(true);
      expect(res.body.aiMessage).toBeDefined();
      expect(res.body.aiMessage.isUser).toBe(false);
      expect(res.body.aiMessage.text).toContain("AI clone");
      expect(res.body.sources).toHaveLength(1);
    });

    it("rejects empty message", async () => {
      const res = await agent
        .post(`/api/chat/conversations/${conversationId}/messages`)
        .send({ text: "" });

      expect(res.status).toBe(400);
    });

    it("rejects missing text field", async () => {
      const res = await agent
        .post(`/api/chat/conversations/${conversationId}/messages`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("returns 404 for non-existent conversation", async () => {
      const res = await agent
        .post("/api/chat/conversations/nonexistent/messages")
        .send({ text: "hello" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/chat/conversations/:id/messages", () => {
    let conversationId: string;

    beforeAll(async () => {
      const convRes = await agent
        .post(`/api/chat/${duplikaId}/conversations`);
      conversationId = convRes.body.id;

      // Send a message to populate
      await agent
        .post(`/api/chat/conversations/${conversationId}/messages`)
        .send({ text: "Test message" });
    });

    it("retrieves messages for a conversation", async () => {
      const res = await agent
        .get(`/api/chat/conversations/${conversationId}/messages`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2); // user msg + AI response
    });

    it("returns 404 for non-existent conversation", async () => {
      const res = await agent
        .get("/api/chat/conversations/nonexistent/messages");

      expect(res.status).toBe(404);
    });
  });
});
