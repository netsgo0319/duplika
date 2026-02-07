import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";

const router = Router();

// In-memory crawl status tracking (per source URL)
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

// POST /api/duplikas/:id/sources/crawl — Enqueue crawl jobs for all sources
router.post("/:id/sources/crawl", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    if (!process.env.REDIS_URL) {
      return res.status(503).json({ message: "Queue service unavailable (REDIS_URL not configured)" });
    }

    const sources = await storage.getContentSourcesByDuplika(req.params.id);
    if (sources.length === 0) {
      return res.status(400).json({ message: "No sources registered" });
    }

    const duplikaId = req.params.id;

    // Enqueue each source as a BullMQ job
    const { Queue } = await import("bullmq");
    const IORedis = (await import("ioredis")).default;
    const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    const queue = new Queue("crawl-pipeline", { connection });

    for (const source of sources) {
      const jobKey = `${duplikaId}:${source.sourceUrl}`;
      crawlJobs.set(jobKey, { status: "pending", startedAt: new Date().toISOString() });

      await queue.add("crawl", {
        duplikaId,
        sourceUrl: source.sourceUrl,
        sourceType: source.sourceType,
      });
    }

    await queue.close();
    await connection.quit();

    return res.json({
      message: "Crawling queued",
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

// Export for testing
export { crawlJobs };
export default router;
