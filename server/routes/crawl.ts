import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { createCrawler } from "../../worker/crawlers/index";
import type { CrawlResult } from "../../shared/types";

const router = Router();

// In-memory crawl status tracking (per source URL)
// In production this would be backed by BullMQ job status
const crawlJobs = new Map<
  string,
  { status: "pending" | "processing" | "completed" | "failed"; error?: string; startedAt: string }
>();

// ─── Helper: check duplika ownership ────────────────────────────
async function getDuplikaIfOwner(duplikaId: string, userId: string) {
  const duplika = await storage.getDuplika(duplikaId);
  if (!duplika) return { error: "not_found" as const, duplika: null };
  if (duplika.ownerId !== userId) return { error: "forbidden" as const, duplika: null };
  return { error: null, duplika };
}

// POST /api/duplikas/:id/sources/crawl — Trigger crawling for all sources
router.post("/:id/sources/crawl", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const sources = await storage.getContentSourcesByDuplika(req.params.id);
    if (sources.length === 0) {
      return res.status(400).json({ message: "No sources registered" });
    }

    const duplikaId = req.params.id;

    // Process each source asynchronously
    for (const source of sources) {
      const jobKey = `${duplikaId}:${source.sourceUrl}`;
      crawlJobs.set(jobKey, { status: "pending", startedAt: new Date().toISOString() });

      // Fire-and-forget crawl processing
      processCrawl(duplikaId, source.sourceType, source.sourceUrl, jobKey).catch(() => {
        // Error already recorded in crawlJobs
      });
    }

    return res.json({
      message: "Crawling started",
      sourceCount: sources.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/duplikas/:id/crawl-status — Get crawl status for all sources
router.get("/:id/crawl-status", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const sources = await storage.getContentSourcesByDuplika(req.params.id);
    const duplikaId = req.params.id;

    const statuses = sources.map((source) => {
      const jobKey = `${duplikaId}:${source.sourceUrl}`;
      const job = crawlJobs.get(jobKey);
      return {
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType,
        status: job?.status ?? "idle",
        error: job?.error,
        startedAt: job?.startedAt,
      };
    });

    return res.json(statuses);
  } catch (err) {
    next(err);
  }
});

// GET /api/duplikas/:id/knowledge — Get indexed content chunks
router.get("/:id/knowledge", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const chunks = await storage.getContentChunksByDuplika(req.params.id);
    return res.json(chunks);
  } catch (err) {
    next(err);
  }
});

// ─── Internal: process a crawl job ───────────────────────────────
async function processCrawl(
  duplikaId: string,
  sourceType: string,
  sourceUrl: string,
  jobKey: string,
): Promise<void> {
  try {
    crawlJobs.set(jobKey, { status: "processing", startedAt: crawlJobs.get(jobKey)!.startedAt });

    const crawler = createCrawler(sourceType);
    const result = await crawler.crawl(sourceUrl);

    // Normalize to array
    const results: CrawlResult[] = Array.isArray(result) ? result : [result];

    // Store each crawl result as content chunks
    for (const item of results) {
      if (item.content) {
        await storage.createContentChunk({
          duplikaId,
          sourceType: item.sourceType,
          sourceUrl: item.sourceUrl,
          chunkText: item.content,
        });
      }
    }

    crawlJobs.set(jobKey, { status: "completed", startedAt: crawlJobs.get(jobKey)!.startedAt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    crawlJobs.set(jobKey, {
      status: "failed",
      error: message,
      startedAt: crawlJobs.get(jobKey)!.startedAt,
    });
    throw err;
  }
}

// Export for testing
export { crawlJobs };
export default router;
