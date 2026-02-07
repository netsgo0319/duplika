import { Ollama } from "ollama";
import { storage, type IStorage } from "../storage";
import { embedText } from "../../worker/pipeline/embedder";
import { searchSimilar } from "../../worker/pipeline/vectorStore";

interface RagContext {
  chunks: Array<{
    chunkText: string;
    sourceType: string;
    sourceUrl: string;
    similarity: number;
  }>;
  facts: string[];
  qaPairs: Array<{ question: string; answer: string }>;
  topicsToAvoid: string[];
  keywordMatch: string | null;
}

export interface RagResponse {
  text: string;
  sources: Array<{
    sourceType: string;
    sourceUrl: string;
    similarity: number;
  }>;
}

function checkKeywordMatch(
  message: string,
  keywordResponses: Array<{ keywords: string; response: string }>,
): string | null {
  const lowerMsg = message.toLowerCase();
  for (const kr of keywordResponses) {
    const keywords = kr.keywords.split(",").map((k) => k.trim().toLowerCase());
    if (keywords.some((kw) => kw.length > 0 && lowerMsg.includes(kw))) {
      return kr.response;
    }
  }
  return null;
}

function buildSystemPrompt(
  displayName: string,
  bio: string | null,
  context: RagContext,
): string {
  let prompt = `You are ${displayName}, an AI clone (duplika) of a content creator. Respond in character as this person would.\n\n`;

  if (bio) {
    prompt += `## About You\n${bio}\n\n`;
  }

  if (context.facts.length > 0) {
    prompt += `## Key Facts About You\n`;
    context.facts.forEach((f) => {
      prompt += `- ${f}\n`;
    });
    prompt += "\n";
  }

  if (context.qaPairs.length > 0) {
    prompt += `## How You Answer Specific Questions\n`;
    context.qaPairs.forEach((qa) => {
      prompt += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
    });
  }

  if (context.chunks.length > 0) {
    prompt += `## Relevant Content From Your Posts/Videos\n`;
    context.chunks.forEach((c) => {
      prompt += `[${c.sourceType}] ${c.chunkText}\n\n`;
    });
  }

  if (context.topicsToAvoid.length > 0) {
    prompt += `## Topics You Must Avoid\nDo NOT discuss these topics: ${context.topicsToAvoid.join(", ")}. Politely redirect if asked.\n\n`;
  }

  prompt += `## Guidelines\n`;
  prompt += `- Stay in character as ${displayName}\n`;
  prompt += `- Use your content and facts to inform your responses\n`;
  prompt += `- Be conversational and friendly\n`;
  prompt += `- If you don't know something, say so honestly rather than making things up\n`;

  return prompt;
}

export interface RagDeps {
  storage: IStorage;
  embedQuery: (text: string) => Promise<number[]>;
  searchChunks: (
    embedding: number[],
    duplikaId: string,
    limit?: number,
  ) => Promise<
    Array<{
      id: string;
      chunkText: string;
      sourceType: string;
      sourceUrl: string;
      similarity: number;
    }>
  >;
  generateResponse: (systemPrompt: string, userMessage: string) => Promise<string>;
}

const defaultDeps: RagDeps = {
  storage,
  embedQuery: async (text: string) => {
    try {
      return await embedText(text);
    } catch {
      // Fallback: return zero vector when no embedding service is available
      return new Array(768).fill(0);
    }
  },
  searchChunks: async (embedding, duplikaId, limit) => {
    try {
      return await searchSimilar(embedding, duplikaId, limit);
    } catch {
      // Fallback: return empty when DB/vector search is not available
      return [];
    }
  },
  generateResponse: async (systemPrompt: string, userMessage: string): Promise<string> => {
    // Try OpenAI API first if available
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            choices: Array<{ message: { content: string } }>;
          };
          return data.choices[0].message.content;
        }
      } catch {
        // Fall through to Ollama
      }
    }

    // Try Ollama
    try {
      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
      const ollama = new Ollama({ host: ollamaUrl });

      const response = await ollama.chat({
        model: process.env.LLM_MODEL || "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      return response.message.content;
    } catch {
      // Fallback: extract persona name from system prompt and return a basic response
      const nameMatch = systemPrompt.match(/You are ([^,]+)/);
      const name = nameMatch ? nameMatch[1] : "the persona";
      return `Thanks for your message! I'm ${name}. I'd be happy to help, but my AI backend is currently unavailable. Please try again later.`;
    }
  },
};

export async function generateRagResponse(
  duplikaId: string,
  userMessage: string,
  deps: RagDeps = defaultDeps,
): Promise<RagResponse> {
  const s = deps.storage;

  // Load duplika profile
  const duplika = await s.getDuplika(duplikaId);
  if (!duplika) {
    throw new Error("Duplika not found");
  }

  // Check keyword responses first
  const keywordResponses = await s.getKeywordResponsesByDuplika(duplikaId);
  const keywordMatch = checkKeywordMatch(userMessage, keywordResponses);

  if (keywordMatch) {
    return { text: keywordMatch, sources: [] };
  }

  // Load context in parallel
  const [facts, qaPairs, topicsToAvoid, queryEmbedding] = await Promise.all([
    s.getFactsByDuplika(duplikaId),
    s.getQaPairsByDuplika(duplikaId),
    s.getTopicsToAvoidByDuplika(duplikaId),
    deps.embedQuery(userMessage),
  ]);

  // Search for relevant content chunks
  const chunks = await deps.searchChunks(queryEmbedding, duplikaId, 5);

  const context: RagContext = {
    chunks,
    facts: facts.map((f) => f.text),
    qaPairs: qaPairs.map((qa) => ({ question: qa.question, answer: qa.answer })),
    topicsToAvoid: topicsToAvoid.map((t) => t.topic),
    keywordMatch: null,
  };

  // Build system prompt and generate response
  const systemPrompt = buildSystemPrompt(duplika.displayName, duplika.bio, context);
  const responseText = await deps.generateResponse(systemPrompt, userMessage);

  return {
    text: responseText,
    sources: chunks.map((c) => ({
      sourceType: c.sourceType,
      sourceUrl: c.sourceUrl,
      similarity: c.similarity,
    })),
  };
}
