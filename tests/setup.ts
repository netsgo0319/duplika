import { beforeAll, afterAll } from "vitest";

// Shared test setup
// Future: add DB connection setup/teardown, test fixtures, etc.

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // Cleanup resources if needed
});
