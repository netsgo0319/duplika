import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { generateRagResponse, type RagDeps } from "../server/services/rag";
import { MemStorage } from "../server/storage";
import { setupAuth } from "../server/auth";
import authRoutes from "../server/routes/auth";
import duplikasRoutes from "../server/routes/duplikas";
import chatRoutes from "../server/routes/chat";
import contentSourceRoutes from "../server/routes/content-sources";
import crawlRoutes from "../server/routes/crawl";

describe("RAG Service", () => {
  let store: MemStorage;
  let duplikaId: string;
  let deps: RagDeps;

  beforeEach(async () => {
    store = new MemStorage();

    // Create a user + duplika
    const user = await store.createUser({ username: "creator", password: "hashed" });
    const duplika = await store.createDuplika({
      displayName: "TestCreator",
      handle: "testcreator",
      bio: "I am a tech YouTuber who reviews gadgets.",
      ownerId: user.id,
    });
    duplikaId = duplika.id;

    // Add facts
    await store.createFact({ duplikaId, text: "I started my channel in 2020" });
    await store.createFact({ duplikaId, text: "My favorite brand is Apple" });

    // Add Q&A
    await store.createQaPair({
      duplikaId,
      question: "What camera do you use?",
      answer: "I use a Sony A7IV for all my videos.",
    });

    // Add topics to avoid
    await store.createTopicToAvoid({ duplikaId, topic: "politics" });

    // Add keyword responses
    await store.createKeywordResponse({
      duplikaId,
      keywords: "sponsor,sponsorship",
      response: "I only work with brands I genuinely believe in. Contact me at biz@test.com",
    });

    // Default deps with mocked embedding + LLM
    deps = {
      storage: store,
      embedQuery: async () => Array(768).fill(0.1),
      searchChunks: async () => [
        {
          id: "chunk1",
          chunkText: "The new iPhone 16 has amazing camera improvements.",
          sourceType: "youtube",
          sourceUrl: "https://youtube.com/watch?v=abc",
          similarity: 0.92,
        },
      ],
      generateResponse: async (_systemPrompt: string, _userMessage: string) => {
        return "Great question! Based on my experience with the iPhone 16...";
      },
    };
  });

  it("generates a RAG response with sources", async () => {
    const result = await generateRagResponse(duplikaId, "What do you think of the iPhone 16?", deps);

    expect(result.text).toBe("Great question! Based on my experience with the iPhone 16...");
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].sourceType).toBe("youtube");
    expect(result.sources[0].similarity).toBe(0.92);
  });

  it("returns keyword match immediately without LLM call", async () => {
    let llmCalled = false;
    deps.generateResponse = async () => {
      llmCalled = true;
      return "should not be called";
    };

    const result = await generateRagResponse(duplikaId, "Tell me about sponsorship", deps);

    expect(llmCalled).toBe(false);
    expect(result.text).toContain("biz@test.com");
    expect(result.sources).toEqual([]);
  });

  it("throws when duplika not found", async () => {
    await expect(generateRagResponse("nonexistent-id", "hello", deps)).rejects.toThrow(
      "Duplika not found",
    );
  });

  it("includes facts and Q&A in context", async () => {
    let capturedPrompt = "";
    deps.generateResponse = async (systemPrompt: string) => {
      capturedPrompt = systemPrompt;
      return "response";
    };

    await generateRagResponse(duplikaId, "Tell me about yourself", deps);

    expect(capturedPrompt).toContain("I started my channel in 2020");
    expect(capturedPrompt).toContain("My favorite brand is Apple");
    expect(capturedPrompt).toContain("What camera do you use?");
    expect(capturedPrompt).toContain("Sony A7IV");
  });

  it("includes topics to avoid in system prompt", async () => {
    let capturedPrompt = "";
    deps.generateResponse = async (systemPrompt: string) => {
      capturedPrompt = systemPrompt;
      return "response";
    };

    await generateRagResponse(duplikaId, "What do you think?", deps);

    expect(capturedPrompt).toContain("politics");
    expect(capturedPrompt).toContain("Must Avoid");
  });

  it("works with no content chunks found", async () => {
    deps.searchChunks = async () => [];

    const result = await generateRagResponse(duplikaId, "Hello there!", deps);

    expect(result.text).toBeDefined();
    expect(result.sources).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Integration tests: Chat API + Content Sources + Crawl
// ═══════════════════════════════════════════════════════════════════

function createApp() {
  const app = express();
  app.use(express.json());
  setupAuth(app);
  app.use("/api/auth", authRoutes);
  app.use("/api/duplikas", duplikasRoutes);
  app.use("/api/duplikas", contentSourceRoutes);
  app.use("/api/duplikas", crawlRoutes);
  app.use("/api/chat", chatRoutes);
  return app;
}

describe("Chat API Integration", () => {
  let app: express.Express;
  let agent: ReturnType<typeof request.agent>;
  let chatDuplikaId: string;

  beforeAll(async () => {
    app = createApp();
    agent = request.agent(app);

    await agent
      .post("/api/auth/register")
      .send({ username: "chatinteguser", password: "chatpass123" });

    const dupRes = await agent.post("/api/duplikas").send({
      displayName: "Chat Test Bot",
      handle: "chat-test-bot",
      bio: "I talk about programming.",
    });
    chatDuplikaId = dupRes.body.id;

    // Add keyword responses
    await agent.post(`/api/duplikas/${chatDuplikaId}/keyword-responses`).send({
      keywords: "hello,hi,hey",
      response: "Hey there! Welcome!",
    });
  });

  it("creates a conversation", async () => {
    const res = await agent.post(`/api/chat/${chatDuplikaId}/conversations`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.duplikaId).toBe(chatDuplikaId);
  });

  it("lists conversations for a duplika", async () => {
    const res = await agent.get(`/api/chat/${chatDuplikaId}/conversations`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("sends a message and gets a keyword-triggered response", async () => {
    const convRes = await agent.post(`/api/chat/${chatDuplikaId}/conversations`);
    const conversationId = convRes.body.id;

    const res = await agent
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .send({ text: "hello there!" });

    expect(res.status).toBe(201);
    expect(res.body.userMessage.text).toBe("hello there!");
    expect(res.body.userMessage.isUser).toBe(true);
    expect(res.body.aiMessage.isUser).toBe(false);
    expect(res.body.aiMessage.text).toBe("Hey there! Welcome!");
  });

  it("sends a message and gets a fallback response", async () => {
    const convRes = await agent.post(`/api/chat/${chatDuplikaId}/conversations`);
    const conversationId = convRes.body.id;

    const res = await agent
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .send({ text: "Tell me about TypeScript" });

    expect(res.status).toBe(201);
    expect(res.body.aiMessage.text.length).toBeGreaterThan(0);
  });

  it("retrieves messages from a conversation", async () => {
    const convRes = await agent.post(`/api/chat/${chatDuplikaId}/conversations`);
    const conversationId = convRes.body.id;

    await agent
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .send({ text: "hi" });

    const res = await agent.get(`/api/chat/conversations/${conversationId}/messages`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("returns 400 for empty message", async () => {
    const convRes = await agent.post(`/api/chat/${chatDuplikaId}/conversations`);
    const conversationId = convRes.body.id;

    const res = await agent
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .send({ text: "" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent conversation", async () => {
    const res = await agent
      .post("/api/chat/conversations/nonexistent/messages")
      .send({ text: "hello" });

    expect(res.status).toBe(404);
  });

  it("returns 404 for non-existent duplika", async () => {
    const res = await agent.post("/api/chat/nonexistent/conversations");
    expect(res.status).toBe(404);
  });

  it("returns 401 for unauthenticated requests", async () => {
    const res = await request(app).post(`/api/chat/${chatDuplikaId}/conversations`);
    expect(res.status).toBe(401);
  });
});

describe("Source -> Crawl -> Status flow", () => {
  let app: express.Express;
  let agent: ReturnType<typeof request.agent>;
  let flowDuplikaId: string;

  beforeAll(async () => {
    app = createApp();
    agent = request.agent(app);

    await agent
      .post("/api/auth/register")
      .send({ username: "crawlflowuser", password: "crawlpass123" });

    const dupRes = await agent.post("/api/duplikas").send({
      displayName: "Crawl Flow Test",
      handle: "crawl-flow-test",
    });
    flowDuplikaId = dupRes.body.id;
  });

  it("registers a content source", async () => {
    const res = await agent.post(`/api/duplikas/${flowDuplikaId}/content-sources`).send({
      sourceType: "instagram",
      sourceUrl: "https://www.instagram.com/crawlflow",
    });
    expect(res.status).toBe(201);
    expect(res.body.sourceType).toBe("instagram");
  });

  it("lists content sources", async () => {
    const res = await agent.get(`/api/duplikas/${flowDuplikaId}/content-sources`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("returns 400 when triggering crawl with no sources on a new duplika", async () => {
    const dupRes = await agent.post("/api/duplikas").send({
      displayName: "Empty Source",
      handle: "empty-source",
    });

    const res = await agent.post(`/api/duplikas/${dupRes.body.id}/sources/crawl`);
    // Without REDIS_URL, returns 503; with no sources, returns 400
    expect([400, 503]).toContain(res.status);
  });

  it("returns 503 when triggering crawl without Redis", async () => {
    // In test environment REDIS_URL is not set, so crawl should return 503
    const crawlRes = await agent.post(`/api/duplikas/${flowDuplikaId}/sources/crawl`);
    expect(crawlRes.status).toBe(503);
    expect(crawlRes.body.message).toContain("Queue service unavailable");
  });

  it("returns crawl-status for sources", async () => {
    const statusRes = await agent.get(`/api/duplikas/${flowDuplikaId}/crawl-status`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body).toHaveLength(1);
    expect(statusRes.body[0]).toHaveProperty("sourceUrl");
    expect(statusRes.body[0]).toHaveProperty("status");
  });

  it("retrieves knowledge chunks", async () => {
    const res = await agent.get(`/api/duplikas/${flowDuplikaId}/knowledge`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("deletes a content source", async () => {
    const createRes = await agent.post(`/api/duplikas/${flowDuplikaId}/content-sources`).send({
      sourceType: "pdf",
      sourceUrl: "https://example.com/to-delete.pdf",
    });

    const res = await agent.delete(
      `/api/duplikas/${flowDuplikaId}/content-sources/${createRes.body.id}`,
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 for crawl on non-existent duplika", async () => {
    const res = await agent.post("/api/duplikas/nonexistent/sources/crawl");
    expect(res.status).toBe(404);
  });

  it("returns 403 for non-owner accessing crawl", async () => {
    const agent2 = request.agent(app);
    await agent2
      .post("/api/auth/register")
      .send({ username: "noncrawlowner", password: "pass123" });

    const res = await agent2.post(`/api/duplikas/${flowDuplikaId}/sources/crawl`);
    expect(res.status).toBe(403);
  });
});
