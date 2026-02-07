import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// GET /api/public/profiles/:handle — Get public profile by handle
router.get("/profiles/:handle", async (req, res, next) => {
  try {
    const duplika = await storage.getDuplikaByHandle(req.params.handle);
    if (!duplika || !duplika.isPublic) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.json(duplika);
  } catch (err) {
    next(err);
  }
});

export default router;
