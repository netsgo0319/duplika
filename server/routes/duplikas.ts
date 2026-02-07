import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import {
  insertDuplikaSchema,
  insertFactSchema,
  insertQaPairSchema,
  insertTopicToAvoidSchema,
  insertShareableLinkSchema,
  insertKeywordResponseSchema,
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// ─── Helper: check duplika ownership ────────────────────────────
async function getDuplikaIfOwner(duplikaId: string, userId: string) {
  const duplika = await storage.getDuplika(duplikaId);
  if (!duplika) return { error: "not_found" as const, duplika: null };
  if (duplika.ownerId !== userId) return { error: "forbidden" as const, duplika: null };
  return { error: null, duplika };
}

// ═══════════════════════════════════════════════════════════════════
// DUPLIKA CRUD (7 routes)
// ═══════════════════════════════════════════════════════════════════

// POST /api/duplikas — Create duplika
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = { ...req.body, ownerId: req.user!.id };
    const parsed = insertDuplikaSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const existing = await storage.getDuplikaByHandle(parsed.data.handle);
    if (existing) {
      return res.status(409).json({ message: "Handle already taken" });
    }

    const duplika = await storage.createDuplika(parsed.data);
    return res.status(201).json(duplika);
  } catch (err) {
    next(err);
  }
});

// GET /api/duplikas — List current user's duplikas
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const duplikas = await storage.getDuplikasByOwner(req.user!.id);
    return res.json(duplikas);
  } catch (err) {
    next(err);
  }
});

// GET /api/duplikas/popular — List public duplikas sorted by conversation count
router.get("/popular", async (req, res, next) => {
  try {
    const duplikas = await storage.getPublicDuplikas();
    // Sort by conversation count (descending)
    const withCounts = await Promise.all(
      duplikas.map(async (d) => ({
        ...d,
        conversationCount: await storage.getConversationCountByDuplika(d.id),
      })),
    );
    withCounts.sort((a, b) => b.conversationCount - a.conversationCount);
    return res.json(withCounts);
  } catch (err) {
    next(err);
  }
});

// GET /api/duplikas/:id — Get duplika by ID
router.get("/:id", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) {
      return res.status(404).json({ message: "Duplika not found" });
    }
    return res.json(duplika);
  } catch (err) {
    next(err);
  }
});

// PUT /api/duplikas/:id — Update duplika (owner only)
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error, duplika } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const updateSchema = insertDuplikaSchema.partial().omit({ ownerId: true });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    // If handle is changing, check uniqueness
    if (parsed.data.handle && parsed.data.handle !== duplika!.handle) {
      const existing = await storage.getDuplikaByHandle(parsed.data.handle);
      if (existing) {
        return res.status(409).json({ message: "Handle already taken" });
      }
    }

    const updated = await storage.updateDuplika(req.params.id, parsed.data);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PUT /api/duplikas/:id/visibility — Toggle isPublic (owner only)
router.put("/:id/visibility", requireAuth, async (req, res, next) => {
  try {
    const { error, duplika } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const schema = z.object({ isPublic: z.boolean() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateDuplika(req.params.id, { isPublic: parsed.data.isPublic });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id — Delete duplika + all sub-resources (owner only)
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const duplikaId = req.params.id;

    // Delete all sub-resources first
    await Promise.all([
      storage.deleteFactsByDuplika(duplikaId),
      storage.deleteQaPairsByDuplika(duplikaId),
      storage.deleteTopicsByDuplika(duplikaId),
      storage.deleteLinksByDuplika(duplikaId),
      storage.deleteKeywordResponsesByDuplika(duplikaId),
    ]);

    await storage.deleteDuplika(duplikaId);
    return res.json({ message: "Duplika deleted" });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// FACTS (4 routes)
// ═══════════════════════════════════════════════════════════════════

// GET /api/duplikas/:id/facts
router.get("/:id/facts", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) return res.status(404).json({ message: "Duplika not found" });

    const items = await storage.getFactsByDuplika(req.params.id);
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/duplikas/:id/facts
router.post("/:id/facts", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const body = { ...req.body, duplikaId: req.params.id };
    const parsed = insertFactSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const fact = await storage.createFact(parsed.data);
    return res.status(201).json(fact);
  } catch (err) {
    next(err);
  }
});

// PUT /api/duplikas/:id/facts/:factId
router.put("/:id/facts/:factId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const updateSchema = insertFactSchema.partial().omit({ duplikaId: true });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateFact(req.params.factId, parsed.data);
    if (!updated) return res.status(404).json({ message: "Fact not found" });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id/facts/:factId
router.delete("/:id/facts/:factId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const deleted = await storage.deleteFact(req.params.factId);
    if (!deleted) return res.status(404).json({ message: "Fact not found" });

    return res.json({ message: "Fact deleted" });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// Q&A PAIRS (4 routes)
// ═══════════════════════════════════════════════════════════════════

// GET /api/duplikas/:id/qa
router.get("/:id/qa", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) return res.status(404).json({ message: "Duplika not found" });

    const items = await storage.getQaPairsByDuplika(req.params.id);
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/duplikas/:id/qa
router.post("/:id/qa", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const body = { ...req.body, duplikaId: req.params.id };
    const parsed = insertQaPairSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const qa = await storage.createQaPair(parsed.data);
    return res.status(201).json(qa);
  } catch (err) {
    next(err);
  }
});

// PUT /api/duplikas/:id/qa/:qaId
router.put("/:id/qa/:qaId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const updateSchema = insertQaPairSchema.partial().omit({ duplikaId: true });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateQaPair(req.params.qaId, parsed.data);
    if (!updated) return res.status(404).json({ message: "Q&A pair not found" });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id/qa/:qaId
router.delete("/:id/qa/:qaId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const deleted = await storage.deleteQaPair(req.params.qaId);
    if (!deleted) return res.status(404).json({ message: "Q&A pair not found" });

    return res.json({ message: "Q&A pair deleted" });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// TOPICS TO AVOID (3 routes)
// ═══════════════════════════════════════════════════════════════════

// GET /api/duplikas/:id/topics-to-avoid
router.get("/:id/topics-to-avoid", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) return res.status(404).json({ message: "Duplika not found" });

    const items = await storage.getTopicsToAvoidByDuplika(req.params.id);
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/duplikas/:id/topics-to-avoid
router.post("/:id/topics-to-avoid", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const body = { ...req.body, duplikaId: req.params.id };
    const parsed = insertTopicToAvoidSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const topic = await storage.createTopicToAvoid(parsed.data);
    return res.status(201).json(topic);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id/topics-to-avoid/:topicId
router.delete("/:id/topics-to-avoid/:topicId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const deleted = await storage.deleteTopicToAvoid(req.params.topicId);
    if (!deleted) return res.status(404).json({ message: "Topic not found" });

    return res.json({ message: "Topic deleted" });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// SHAREABLE LINKS (3 routes)
// ═══════════════════════════════════════════════════════════════════

// GET /api/duplikas/:id/shareable-links
router.get("/:id/shareable-links", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) return res.status(404).json({ message: "Duplika not found" });

    const items = await storage.getShareableLinksByDuplika(req.params.id);
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/duplikas/:id/shareable-links
router.post("/:id/shareable-links", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const body = { ...req.body, duplikaId: req.params.id };
    const parsed = insertShareableLinkSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const link = await storage.createShareableLink(parsed.data);
    return res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id/shareable-links/:linkId
router.delete("/:id/shareable-links/:linkId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const deleted = await storage.deleteShareableLink(req.params.linkId);
    if (!deleted) return res.status(404).json({ message: "Link not found" });

    return res.json({ message: "Link deleted" });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// KEYWORD RESPONSES (4 routes)
// ═══════════════════════════════════════════════════════════════════

// GET /api/duplikas/:id/keyword-responses
router.get("/:id/keyword-responses", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) return res.status(404).json({ message: "Duplika not found" });

    const items = await storage.getKeywordResponsesByDuplika(req.params.id);
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/duplikas/:id/keyword-responses
router.post("/:id/keyword-responses", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const body = { ...req.body, duplikaId: req.params.id };
    const parsed = insertKeywordResponseSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const kr = await storage.createKeywordResponse(parsed.data);
    return res.status(201).json(kr);
  } catch (err) {
    next(err);
  }
});

// PUT /api/duplikas/:id/keyword-responses/:resId
router.put("/:id/keyword-responses/:resId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const updateSchema = insertKeywordResponseSchema.partial().omit({ duplikaId: true });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const updated = await storage.updateKeywordResponse(req.params.resId, parsed.data);
    if (!updated) return res.status(404).json({ message: "Keyword response not found" });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/duplikas/:id/keyword-responses/:resId
router.delete("/:id/keyword-responses/:resId", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const deleted = await storage.deleteKeywordResponse(req.params.resId);
    if (!deleted) return res.status(404).json({ message: "Keyword response not found" });

    return res.json({ message: "Keyword response deleted" });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// OTHER (3 routes)
// ═══════════════════════════════════════════════════════════════════

// GET /api/duplikas/:id/stats — Get duplika statistics
router.get("/:id/stats", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplika(req.params.id);
    if (!duplika) return res.status(404).json({ message: "Duplika not found" });

    const [factsCount, qaCount, topicsCount, linksCount, keywordsCount, conversationCount] =
      await Promise.all([
        storage.getFactsByDuplika(req.params.id).then((r) => r.length),
        storage.getQaPairsByDuplika(req.params.id).then((r) => r.length),
        storage.getTopicsToAvoidByDuplika(req.params.id).then((r) => r.length),
        storage.getShareableLinksByDuplika(req.params.id).then((r) => r.length),
        storage.getKeywordResponsesByDuplika(req.params.id).then((r) => r.length),
        storage.getConversationCountByDuplika(req.params.id),
      ]);

    return res.json({
      factsCount,
      qaCount,
      topicsCount,
      linksCount,
      keywordsCount,
      conversationCount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/duplikas/:id/conversations — List conversations
router.get("/:id/conversations", requireAuth, async (req, res, next) => {
  try {
    const { error } = await getDuplikaIfOwner(req.params.id, req.user!.id);
    if (error === "not_found") return res.status(404).json({ message: "Duplika not found" });
    if (error === "forbidden") return res.status(403).json({ message: "Not authorized" });

    const convos = await storage.getConversationsByDuplika(req.params.id);
    return res.json(convos);
  } catch (err) {
    next(err);
  }
});

export default router;
