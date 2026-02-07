const EMBEDDING_DIM = 768;

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
  return embedWithGemini(texts);
}
