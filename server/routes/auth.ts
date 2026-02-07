import { Router } from "express";
import passport from "passport";
import { storage } from "../storage";
import { hashPassword, requireAuth } from "../auth";
import { insertUserSchema } from "@shared/schema";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { username, password } = parsed.data;

    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({ username, password: hashedPassword });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({
        id: user.id,
        username: user.username,
      });
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({
        id: user.id,
        username: user.username,
      });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out" });
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    username: user.username,
  });
});

export default router;
