import { Ollama } from "ollama";

const EMBEDDING_DIM = 768;

async function embedWithOllama(texts: string[]): Promise<number[][]> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollama = new Ollama({ host: ollamaUrl });
  const results: number[][] = [];
  for (const text of texts) {
    const response = await ollama.embed({
      model: "nomic-embed-text",
      input: text,
    });
    results.push(response.embeddings[0]);
  }
  return results;
}

async function embedWithGemini(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = "text-embedding-004";
  const results: number[][] = [];

  for (const text of texts) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text }] },
          outputDimensionality: EMBEDDING_DIM,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini embedding API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as {
      embedding: { values: number[] };
    };
    results.push(data.embedding.values);
  }

  return results;
}

export async function embedText(text: string): Promise<number[]> {
  const results = await embedTexts([text]);
  return results[0];
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  // Ollama (local worker) takes priority when available
  if (process.env.OLLAMA_URL) {
    return embedWithOllama(texts);
  }
  // Gemini embedding API (Railway server)
  if (process.env.GEMINI_API_KEY) {
    return embedWithGemini(texts);
  }
  throw new Error("No embedding provider configured. Set OLLAMA_URL or GEMINI_API_KEY.");
}
