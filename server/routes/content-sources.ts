import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { insertContentSourceSchema } from "@shared/schema";
import { notifySlack } from "../services/slack";

const router = Router();

// Helper: check duplika ownership
async function getDuplikaIfOwner(duplikaId: string, userId: string) {
  const duplika = await storage.getDuplika(duplikaId);
  if (!duplika) return { error: "not_found" as const, duplika: null };
  if (duplika.ownerId !== userId) return { error: "forbidden" as const, duplika: null };
  return { error: null, duplika };
}

// GET /api/duplikas/:id/content-sources — List sources
router.get("/:id/content-sources", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Forbidden" });

    const sources = await storage.getContentSourcesByDuplika(req.params.id);
    return res.json(sources);
  } catch (err) {
    next(err);
  }
});

// POST /api/duplikas/:id/content-sources — Add source
router.post("/:id/content-sources", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Forbidden" });

    const body = { ...req.body, duplikaId: req.params.id };
    const parsed = insertContentSourceSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const source = await storage.createContentSource(parsed.data);
    notifySlack(`Source added: [${parsed.data.sourceType}] ${parsed.data.sourceUrl} (duplika: ${req.params.id})`);

    // Enqueue BullMQ job if Redis is available
    if (process.env.REDIS_URL) {
      try {
        const { Queue } = await import("bullmq");
        const IORedis = (await import("ioredis")).default;
        const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
        const queue = new Queue("crawl-pipeline", { connection });
        await queue.add("crawl", {
          duplikaId: req.params.id,
          sourceUrl: parsed.data.sourceUrl,
          sourceType: parsed.data.sourceType,
        });
        await queue.close();
        await connection.quit();
      } catch (queueErr) {
        console.error("Failed to enqueue crawl job:", queueErr);
      }
    }

    return res.status(201).json(source);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id/content-sources/:sourceId — Remove source
router.delete("/:id/content-sources/:sourceId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Forbidden" });

    const deleted = await storage.deleteContentSource(req.params.sourceId);
    if (!deleted) {
      return res.status(404).json({ message: "Content source not found" });
    }

    return res.json({ message: "Content source deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
