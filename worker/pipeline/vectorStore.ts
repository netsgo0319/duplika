import { db } from "../../server/db";
import { contentChunks } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";

export async function storeChunks(
  duplikaId: string,
  sourceType: string,
  sourceUrl: string,
  chunks: string[],
  embeddings: number[][],
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!db) throw new Error("Database not connected");
  if (chunks.length === 0) return;

  const rows = chunks.map((chunkText, i) => ({
    duplikaId,
    sourceType,
    sourceUrl,
    chunkText,
    embedding: embeddings[i],
    metadata: metadata ?? null,
  }));

  await db.insert(contentChunks).values(rows);
}

export async function searchSimilar(
  queryEmbedding: number[],
  duplikaId: string,
  limit: number = 5,
): Promise<
  Array<{
    id: string;
    chunkText: string;
    sourceType: string;
    sourceUrl: string;
    similarity: number;
  }>
> {
  if (!db) throw new Error("Database not connected");

  const vectorStr = `[${queryEmbedding.join(",")}]`;
  const result = await db.execute(sql`
    SELECT
      id,
      chunk_text AS "chunkText",
      source_type AS "sourceType",
      source_url AS "sourceUrl",
      1 - (embedding <=> ${vectorStr}::vector) AS similarity
    FROM content_chunks
    WHERE duplika_id = ${duplikaId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `);

  return result.rows as Array<{
    id: string;
    chunkText: string;
    sourceType: string;
    sourceUrl: string;
    similarity: number;
  }>;
}

export async function deleteBySource(
  duplikaId: string,
  sourceUrl: string,
): Promise<void> {
  if (!db) throw new Error("Database not connected");

  await db
    .delete(contentChunks)
    .where(
      and(
        eq(contentChunks.duplikaId, duplikaId),
        eq(contentChunks.sourceUrl, sourceUrl),
      ),
    );
}
