/**
 * Live RAG tests — actually calls Gemini API.
 * Skipped when GEMINI_API_KEY is not set.
 *
 * Run manually:
 *   GEMINI_API_KEY=<key> npm test -- tests/rag-live.test.ts
 */
import { describe, it, expect, beforeEach } from "vitest";
import { generateRagResponse, type RagDeps } from "../server/services/rag";
import { MemStorage } from "../server/storage";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const describeIfKey = GEMINI_KEY ? describe : describe.skip;

describeIfKey("RAG Live (Gemini)", () => {
  let store: MemStorage;
  let duplikaId: string;
  let deps: RagDeps;

  beforeEach(async () => {
    store = new MemStorage();

    const user = await store.createUser({ username: "creator", password: "hashed" });
    const duplika = await store.createDuplika({
      displayName: "김테크",
      handle: "kimtech",
      bio: "한국의 테크 유튜버. 가젯 리뷰와 IT 뉴스를 다룹니다. 항상 한국어로 대답합니다.",
      ownerId: user.id,
    });
    duplikaId = duplika.id;

    await store.createFact({ duplikaId, text: "2020년에 유튜브 채널을 시작했다" });
    await store.createFact({ duplikaId, text: "가장 좋아하는 브랜드는 Apple이다" });
    await store.createFact({ duplikaId, text: "구독자 수는 50만명이다" });

    await store.createQaPair({
      duplikaId,
      question: "어떤 카메라 써요?",
      answer: "Sony A7IV를 모든 영상 촬영에 사용합니다.",
    });
    await store.createQaPair({
      duplikaId,
      question: "추천 노트북이 뭐에요?",
      answer: "맥북 프로 M3를 추천합니다. 영상 편집에 최고예요.",
    });

    await store.createTopicToAvoid({ duplikaId, topic: "정치" });
    await store.createTopicToAvoid({ duplikaId, topic: "종교" });

    await store.createKeywordResponse({
      duplikaId,
      keywords: "광고,협찬,스폰서",
      response: "광고 및 협찬 문의는 biz@kimtech.com 으로 보내주세요!",
    });

    deps = {
      storage: store,
      embedQuery: async () => new Array(768).fill(0.1),
      searchChunks: async () => [
        {
          id: "chunk1",
          chunkText: "아이폰 16 프로의 카메라가 전작 대비 크게 개선되었습니다. 특히 저조도 촬영 성능이 눈에 띄게 좋아졌어요.",
          sourceType: "youtube",
          sourceUrl: "https://youtube.com/watch?v=iphone16",
          similarity: 0.91,
        },
      ],
      generateResponse: undefined as unknown as RagDeps["generateResponse"],
    };

    // Use the real Gemini generateResponse from defaultDeps
    const ragModule = await import("../server/services/rag");
    // Access the default generateResponse by creating a response with no deps override
    // Instead, replicate the real Gemini call here
    deps.generateResponse = async (systemPrompt: string, userMessage: string): Promise<string> => {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned empty response");
      return text;
    };
  });

  it("facts가 반영된 답변을 생성한다", async () => {
    const result = await generateRagResponse(duplikaId, "채널 언제 시작했어요?", deps);

    expect(result.text).toBeTruthy();
    expect(result.text).toMatch(/2020/);
    console.log("[facts test]", result.text);
  }, 30_000);

  it("Q&A 페어에 맞는 답변을 한다", async () => {
    const result = await generateRagResponse(duplikaId, "어떤 카메라 쓰세요?", deps);

    expect(result.text).toBeTruthy();
    expect(result.text).toMatch(/Sony|A7IV|소니/i);
    console.log("[QA test]", result.text);
  }, 30_000);

  it("기피 토픽에 대해 거절한다", async () => {
    const result = await generateRagResponse(duplikaId, "한국 정치에 대해 어떻게 생각해요?", deps);

    expect(result.text).toBeTruthy();
    // Should politely deflect — not engage with the topic
    const lower = result.text.toLowerCase();
    const deflected =
      lower.includes("정치") === false ||
      lower.includes("다루지") ||
      lower.includes("피하") ||
      lower.includes("어려") ||
      lower.includes("답변") ||
      lower.includes("테크") ||
      lower.includes("가젯");
    expect(deflected).toBe(true);
    console.log("[avoid test]", result.text);
  }, 30_000);

  it("콘텐츠 청크 기반으로 답변한다", async () => {
    const result = await generateRagResponse(duplikaId, "아이폰 16 프로 카메라 어때요?", deps);

    expect(result.text).toBeTruthy();
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].sourceType).toBe("youtube");
    // Response should reference camera improvements from the chunk
    const hasRelevantContent =
      result.text.includes("카메라") ||
      result.text.includes("저조도") ||
      result.text.includes("아이폰") ||
      result.text.includes("iPhone");
    expect(hasRelevantContent).toBe(true);
    console.log("[chunk test]", result.text);
  }, 30_000);

  it("키워드 응답은 LLM 없이 즉시 반환한다", async () => {
    const result = await generateRagResponse(duplikaId, "광고 문의 드립니다", deps);

    expect(result.text).toBe("광고 및 협찬 문의는 biz@kimtech.com 으로 보내주세요!");
    expect(result.sources).toEqual([]);
  }, 10_000);

  it("페르소나를 유지하며 대화한다", async () => {
    const result = await generateRagResponse(duplikaId, "자기소개 해주세요", deps);

    expect(result.text).toBeTruthy();
    const hasPersona =
      result.text.includes("김테크") ||
      result.text.includes("테크") ||
      result.text.includes("유튜") ||
      result.text.includes("가젯") ||
      result.text.includes("리뷰");
    expect(hasPersona).toBe(true);
    console.log("[persona test]", result.text);
  }, 30_000);
});
