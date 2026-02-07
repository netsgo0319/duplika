import { describe, it, expect } from "vitest";
import { chunkText } from "../../worker/pipeline/chunker";

describe("chunkText", () => {
  it("returns single chunk for short text", async () => {
    const text = "This is a short text.";
    const chunks = await chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("returns multiple chunks for long text", async () => {
    // Generate text longer than 500 characters
    const paragraph = "This is a sentence that is used to fill up space. ";
    const text = paragraph.repeat(30); // ~1500 chars
    const chunks = await chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      // Each chunk should be at most chunkSize (500) chars (with some tolerance for split boundaries)
      expect(chunk.length).toBeLessThanOrEqual(500);
    }
  });

  it("produces overlapping chunks", async () => {
    // Create text that will definitely split into multiple chunks
    const sentences: string[] = [];
    for (let i = 0; i < 30; i++) {
      sentences.push(`Sentence number ${i} contains important information.`);
    }
    const text = sentences.join(" ");
    const chunks = await chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);

    // Check overlap: the end of chunk N should share text with the beginning of chunk N+1
    for (let i = 0; i < chunks.length - 1; i++) {
      const endOfCurrent = chunks[i].slice(-50);
      const startOfNext = chunks[i + 1].slice(0, 100);
      // At least some of the ending text should appear in the next chunk
      const hasOverlap = endOfCurrent
        .split(" ")
        .some((word) => word.length > 3 && startOfNext.includes(word));
      expect(hasOverlap).toBe(true);
    }
  });

  it("returns empty array for empty text", async () => {
    expect(await chunkText("")).toEqual([]);
    expect(await chunkText("   ")).toEqual([]);
  });
});
