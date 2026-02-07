import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db and schema using inline factories (no top-level variable references)
vi.mock("../../server/db", () => {
  const valuesFn = vi.fn().mockResolvedValue(undefined);
  const insertFn = vi.fn().mockReturnValue({ values: valuesFn });
  const whereFn = vi.fn().mockResolvedValue(undefined);
  const deleteFn = vi.fn().mockReturnValue({ where: whereFn });
  const executeFn = vi.fn().mockResolvedValue({ rows: [] });

  return {
    db: {
      insert: insertFn,
      execute: executeFn,
      delete: deleteFn,
      __mocks: { insertFn, valuesFn, executeFn, deleteFn, whereFn },
    },
  };
});

vi.mock("../../shared/schema", () => ({
  contentChunks: {
    duplikaId: "duplika_id",
    sourceUrl: "source_url",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, val: unknown) => ({ column: col, value: val, op: "eq" }),
  and: (...conditions: unknown[]) => ({ conditions, op: "and" }),
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings: Array.from(strings),
    values,
    type: "sql",
  }),
}));

import { storeChunks, searchSimilar, deleteBySource } from "../../worker/pipeline/vectorStore";
import { db } from "../../server/db";

// Access the mock functions through __mocks
const mocks = (db as unknown as { __mocks: Record<string, ReturnType<typeof vi.fn>> }).__mocks;

describe("vectorStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup default return values after clear
    mocks.insertFn.mockReturnValue({ values: mocks.valuesFn });
    mocks.deleteFn.mockReturnValue({ where: mocks.whereFn });
    mocks.valuesFn.mockResolvedValue(undefined);
    mocks.whereFn.mockResolvedValue(undefined);
    mocks.executeFn.mockResolvedValue({ rows: [] });
  });

  describe("storeChunks", () => {
    it("inserts chunks with embeddings into content_chunks", async () => {
      const chunks = ["chunk 1", "chunk 2"];
      const embeddings = [Array(768).fill(0.1), Array(768).fill(0.2)];

      await storeChunks("d1", "youtube", "https://yt.com/1", chunks, embeddings);

      expect(mocks.insertFn).toHaveBeenCalledTimes(1);
      expect(mocks.valuesFn).toHaveBeenCalledWith([
        {
          duplikaId: "d1",
          sourceType: "youtube",
          sourceUrl: "https://yt.com/1",
          chunkText: "chunk 1",
          embedding: embeddings[0],
          metadata: null,
        },
        {
          duplikaId: "d1",
          sourceType: "youtube",
          sourceUrl: "https://yt.com/1",
          chunkText: "chunk 2",
          embedding: embeddings[1],
          metadata: null,
        },
      ]);
    });

    it("does nothing for empty chunks array", async () => {
      await storeChunks("d1", "youtube", "https://yt.com/1", [], []);
      expect(mocks.insertFn).not.toHaveBeenCalled();
    });

    it("passes metadata when provided", async () => {
      const meta = { title: "Test Video" };
      await storeChunks("d1", "youtube", "https://yt.com/1", ["chunk"], [Array(768).fill(0)], meta);

      expect(mocks.valuesFn).toHaveBeenCalledWith([
        expect.objectContaining({ metadata: meta }),
      ]);
    });
  });

  describe("searchSimilar", () => {
    it("executes cosine similarity query", async () => {
      const queryEmbedding = Array(768).fill(0.5);
      mocks.executeFn.mockResolvedValueOnce({
        rows: [
          {
            id: "c1",
            chunkText: "result chunk",
            sourceType: "youtube",
            sourceUrl: "https://yt.com/1",
            similarity: 0.95,
          },
        ],
      });

      const results = await searchSimilar(queryEmbedding, "d1", 5);

      expect(mocks.executeFn).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
      expect(results[0].similarity).toBe(0.95);
    });

    it("returns empty array when no matches", async () => {
      mocks.executeFn.mockResolvedValueOnce({ rows: [] });
      const results = await searchSimilar(Array(768).fill(0), "d1");
      expect(results).toEqual([]);
    });
  });

  describe("deleteBySource", () => {
    it("deletes chunks matching duplikaId and sourceUrl", async () => {
      await deleteBySource("d1", "https://yt.com/1");

      expect(mocks.deleteFn).toHaveBeenCalledTimes(1);
      expect(mocks.whereFn).toHaveBeenCalledTimes(1);
    });
  });
});
