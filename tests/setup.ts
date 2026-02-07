import { beforeAll, afterAll } from "vitest";

// Shared test setup
// Future: add DB connection setup/teardown, test fixtures, etc.

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  // Prevent tests from hitting real Ollama/OpenAI services
  // Point to a non-existent port so Ollama connection fails immediately → triggers fallback
  process.env.OLLAMA_URL = "http://localhost:1";
  delete process.env.OPENAI_API_KEY;
});

afterAll(() => {
  // Cleanup resources if needed
});
