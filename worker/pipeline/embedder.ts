import { Ollama } from "ollama";

const EMBEDDING_DIM = 768;

function useOllama(): boolean {
  return !!process.env.OLLAMA_URL;
}

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

async function embedWithOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
      dimensions: EMBEDDING_DIM,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data.map((d) => d.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const results = await embedTexts([text]);
  return results[0];
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (useOllama()) {
    return embedWithOllama(texts);
  }
  return embedWithOpenAI(texts);
}
