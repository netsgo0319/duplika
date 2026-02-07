import { describe, it, expect } from "vitest";
import {
  users,
  sessions,
  duplikas,
  facts,
  qaPairs,
  topicsToAvoid,
  shareableLinks,
  keywordResponses,
  conversations,
  messages,
  contentSources,
  contentChunks,
  insertUserSchema,
  insertDuplikaSchema,
  insertFactSchema,
  insertQaPairSchema,
  insertTopicToAvoidSchema,
  insertShareableLinkSchema,
  insertKeywordResponseSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertContentSourceSchema,
  insertContentChunkSchema,
} from "@shared/schema";
import { getTableName } from "drizzle-orm";

describe("Schema definitions", () => {
  it("should export all 12 tables", () => {
    const tables = [
      users,
      sessions,
      duplikas,
      facts,
      qaPairs,
      topicsToAvoid,
      shareableLinks,
      keywordResponses,
      conversations,
      messages,
      contentSources,
      contentChunks,
    ];
    expect(tables).toHaveLength(12);
    tables.forEach((table) => {
      expect(table).toBeDefined();
    });
  });

  it("should have correct table names", () => {
    expect(getTableName(users)).toBe("users");
    expect(getTableName(sessions)).toBe("session");
    expect(getTableName(duplikas)).toBe("duplikas");
    expect(getTableName(facts)).toBe("facts");
    expect(getTableName(qaPairs)).toBe("qa_pairs");
    expect(getTableName(topicsToAvoid)).toBe("topics_to_avoid");
    expect(getTableName(shareableLinks)).toBe("shareable_links");
    expect(getTableName(keywordResponses)).toBe("keyword_responses");
    expect(getTableName(conversations)).toBe("conversations");
    expect(getTableName(messages)).toBe("messages");
    expect(getTableName(contentSources)).toBe("content_sources");
    expect(getTableName(contentChunks)).toBe("content_chunks");
  });

  it("should export all insert schemas", () => {
    const schemas = [
      insertUserSchema,
      insertDuplikaSchema,
      insertFactSchema,
      insertQaPairSchema,
      insertTopicToAvoidSchema,
      insertShareableLinkSchema,
      insertKeywordResponseSchema,
      insertConversationSchema,
      insertMessageSchema,
      insertContentSourceSchema,
      insertContentChunkSchema,
    ];
    schemas.forEach((schema) => {
      expect(schema).toBeDefined();
      expect(schema.parse).toBeTypeOf("function");
    });
  });

  it("should validate insertUserSchema correctly", () => {
    const valid = { username: "testuser", password: "testpass" };
    expect(() => insertUserSchema.parse(valid)).not.toThrow();

    const invalid = { username: "" };
    expect(() => insertUserSchema.parse(invalid)).toThrow();
  });

  it("should validate insertDuplikaSchema correctly", () => {
    const valid = {
      displayName: "Test Duplika",
      handle: "test-handle",
      ownerId: "some-uuid",
    };
    expect(() => insertDuplikaSchema.parse(valid)).not.toThrow();
  });

  it("should validate insertContentChunkSchema correctly", () => {
    const valid = {
      duplikaId: "some-uuid",
      sourceType: "youtube",
      sourceUrl: "https://youtube.com/watch?v=123",
      chunkText: "Some transcribed text content here.",
    };
    expect(() => insertContentChunkSchema.parse(valid)).not.toThrow();
  });
});
