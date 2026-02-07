import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the Ollama module - factory must not reference outer variables
vi.mock("ollama", () => {
  const mockEmbed = vi.fn().mockResolvedValue({
    embeddings: [Array(768).fill(0.1)],
  });
  return {
    Ollama: vi.fn().mockImplementation(function () {
      return { embed: mockEmbed };
    }),
  };
});

describe("embedder", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  describe("Gemini backend (no OLLAMA_URL)", () => {
    beforeEach(() => {
      delete process.env.OLLAMA_URL;
      process.env.GEMINI_API_KEY = "test-key";
    });

    it("embedText returns 768-dim vector", async () => {
      const mockEmbedding = Array(768).fill(0.5);
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          embedding: { values: mockEmbedding },
        }),
      }) as unknown as typeof fetch;

      const { embedText } = await import("../../worker/pipeline/embedder");
      const result = await embedText("hello world");
      expect(result).toHaveLength(768);
      expect(result).toEqual(mockEmbedding);
    });

    it("embedTexts returns correct number of vectors", async () => {
      const texts = ["text one", "text two", "text three"];
      const mockEmbeddings = texts.map((_, i) => Array(768).fill(i * 0.1));
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(async () => ({
        ok: true,
        json: async () => ({
          embedding: { values: mockEmbeddings[callCount++] },
        }),
      })) as unknown as typeof fetch;

      const { embedTexts } = await import("../../worker/pipeline/embedder");
      const results = await embedTexts(texts);
      expect(results).toHaveLength(3);
      results.forEach((vec) => expect(vec).toHaveLength(768));
    });

    it("handles API errors gracefully", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      }) as unknown as typeof fetch;

      const { embedText } = await import("../../worker/pipeline/embedder");
      await expect(embedText("hello")).rejects.toThrow("Gemini embedding API error: 429");
    });
  });

  describe("Ollama backend (OLLAMA_URL set)", () => {
    beforeEach(() => {
      process.env.OLLAMA_URL = "http://localhost:11434";
    });

    it("embedText returns 768-dim vector", async () => {
      const { embedText } = await import("../../worker/pipeline/embedder");
      const result = await embedText("hello world");
      expect(result).toHaveLength(768);
    });

    it("embedTexts returns correct number of vectors", async () => {
      const { embedTexts } = await import("../../worker/pipeline/embedder");
      const results = await embedTexts(["text one", "text two"]);
      expect(results).toHaveLength(2);
      results.forEach((vec) => expect(vec).toHaveLength(768));
    });
  });
});
