import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { generateRagResponse } from "../services/rag";

const router = Router();

// POST /api/chat/:duplikaId/conversations — Create conversation
router.post("/:duplikaId/conversations", requireAuth, async (req, res, next) => {
  try {
    const { duplikaId } = req.params;
    const duplika = await storage.getDuplika(duplikaId);
    if (!duplika) {
      return res.status(404).json({ message: "Duplika not found" });
    }

    const conversation = await storage.createConversation({
      duplikaId,
      userId: req.user!.id,
    });

    return res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/:duplikaId/conversations — List conversations
router.get("/:duplikaId/conversations", requireAuth, async (req, res, next) => {
  try {
    const { duplikaId } = req.params;
    const duplika = await storage.getDuplika(duplikaId);
    if (!duplika) {
      return res.status(404).json({ message: "Duplika not found" });
    }

    const conversations = await storage.getConversationsByDuplika(duplikaId);
    return res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/conversations/:conversationId/messages — Get messages
router.get("/conversations/:conversationId/messages", requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await storage.getMessagesByConversation(conversationId);
    return res.json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/conversations/:conversationId/messages — Send message (triggers RAG)
router.post("/conversations/:conversationId/messages", requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Save user message
    const userMessage = await storage.createMessage({
      conversationId,
      text: text.trim(),
      isUser: true,
    });

    // Generate RAG response
    const ragResponse = await generateRagResponse(conversation.duplikaId, text.trim());

    // Save AI response
    const aiMessage = await storage.createMessage({
      conversationId,
      text: ragResponse.text,
      isUser: false,
      source: ragResponse.sources.length > 0 ? ragResponse.sources : undefined,
    });

    return res.status(201).json({
      userMessage,
      aiMessage,
      sources: ragResponse.sources,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
