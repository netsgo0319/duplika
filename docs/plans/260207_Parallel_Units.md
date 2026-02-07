# 병렬 개발 단위 계획 (2026.02.07)

## 개요

DB 스키마(WS-0) 완료 후, 4개 워크스트림을 동시 착수할 수 있다.
이후 RAG 채팅(WS-5)과 프론트 연동(WS-6)을 순차 진행한다.

```
WS-0 (DB 스키마) ─── 선행, 1일
 │
 ├── WS-1 (인증)          ── 독립
 ├── WS-2 (CRUD API)      ── 독립
 ├── WS-3 (크롤러)        ── 독립
 ├── WS-4 (임베딩 파이프)  ── 독립
 │
 │   ※ WS-1~4: WS-0 완료 후 동시 착수 (최대 4개 병렬)
 │
 ├── WS-5 (RAG 채팅)      ── WS-3 + WS-4 완료 후
 └── WS-6 (프론트 연동)    ── WS-1 + WS-2 완료 후 (CRUD)
                               WS-5 완료 후 (채팅)
```

---

## WS-0: DB 스키마 전체 정의 (선행)

**의존:** 없음 | **차단:** WS-1~6 전부

모든 테이블을 `shared/schema.ts`에 정의하고 마이그레이션 실행.

**산출물:**
- `shared/schema.ts` — 12개 테이블 (users, sessions, duplikas, facts, qa_pairs, topics_to_avoid, shareable_links, keyword_responses, conversations, messages, content_sources, content_chunks)
- `migrations/` — 생성된 마이그레이션

**완료 조건:**
- `npm run db:push` 성공
- pgvector 확장 활성화 (`CREATE EXTENSION vector`)
- 모든 테이블 확인

---

## WS-1: 인증 시스템

**의존:** WS-0 | **차단:** WS-6 (프론트 연동)

Passport.js + express-session 기반 인증.

**산출물:**
- `server/auth.ts` — Passport 전략 + 세션 설정
- `server/routes/auth.ts` — 인증 API 라우트
- `server/storage.ts` — IStorage를 DB 연동으로 전환
- `tests/auth.test.ts`

**API (4개):**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

**완료 조건:**
- 회원가입 → 로그인 → 세션 유지 → 로그아웃 흐름 테스트 통과
- 비인증 요청 401 테스트 통과

---

## WS-2: 듀플리카 CRUD + 서브리소스 API

**의존:** WS-0 | **차단:** WS-6 (프론트 연동)

듀플리카 관리 + Facts, Q&A, Topics, Links, Keywords CRUD.

**산출물:**
- `server/routes/duplikas.ts` — 전체 CRUD + 서브리소스 라우트
- `server/storage.ts` — 각 엔티티 CRUD 메서드 추가
- `tests/duplikas.test.ts`
- `tests/sub-resources.test.ts`

**API (28개):**
```
듀플리카:  POST/GET/GET popular/GET :id/PUT/DELETE/PUT visibility  (7)
Facts:     GET/POST/PUT/DELETE                                     (4)
Q&A:       GET/POST/PUT/DELETE                                     (4)
Topics:    GET/POST/DELETE                                         (3)
Links:     GET/POST/DELETE                                         (3)
Keywords:  GET/POST/PUT/DELETE                                     (4)
Public:    GET /api/public/profiles/:handle                        (1)
Stats:     GET /api/duplikas/:id/stats                             (1)
Convos:    GET /api/duplikas/:id/conversations                     (1)
```

**완료 조건:**
- 각 엔드포인트 CRUD 테스트 통과
- 404 / 유효성 검증 테스트 통과

---

## WS-3: 크롤러 모듈

**의존:** WS-0 | **차단:** WS-5 (RAG 채팅)

YouTube, Instagram 크롤러. 각 크롤러는 서로 독립 (소스별 병렬 가능).

**산출물:**
- `worker/crawlers/youtube.ts`
- `worker/crawlers/instagram.ts`
- `tests/crawlers/youtube.test.ts`

**사용 라이브러리:** youtube-transcript, Instagram API

**완료 조건:**
- 각 크롤러가 통일된 `CrawlResult` 타입 반환
- mock 기반 유닛 테스트 통과

---

## WS-4: 임베딩 + 벡터 파이프라인

**의존:** WS-0 | **차단:** WS-5 (RAG 채팅)

텍스트 → 청킹 → 임베딩 → pgvector 저장. PDF 파싱 지원 포함.

**산출물:**
- `worker/pipeline/chunker.ts` — RecursiveCharacterTextSplitter (500자, 50자 오버랩)
- `worker/pipeline/embedder.ts` — Ollama/OpenAI 임베딩 호출
- `worker/pipeline/vectorStore.ts` — pgvector INSERT/검색
- `worker/index.ts` — BullMQ Worker 진입점
- PDF 파서 — `pdf-parse`로 PDF 텍스트 추출 후 청킹 파이프라인 연결
- `tests/pipeline/chunker.test.ts`
- `tests/pipeline/embedder.test.ts`
- `tests/pipeline/vectorStore.test.ts`

**완료 조건:**
- 청크 분할 정확성 테스트 통과
- 임베딩 768d 벡터 반환 테스트 통과 (mock)
- pgvector INSERT → cosine similarity 검색 테스트 통과
- PDF → 텍스트 추출 → 청킹 테스트 통과

---

## WS-5: RAG 채팅 엔드포인트

**의존:** WS-3 + WS-4 | **차단:** WS-6 (채팅 프론트)

벡터 검색 + LLM 생성으로 채팅 응답.

**산출물:**
- `server/routes/chat.ts` — RAG 채팅 API
- `server/routes/content-sources.ts` — 소스 관리 API
- `server/routes/crawl.ts` — 크롤링 트리거/상태 API
- `tests/rag.test.ts`
- `tests/chat.test.ts`

**API (8개):**
```
POST /api/chat/:duplikaId/message      RAG 응답
GET  /api/chat/:duplikaId              대화 내역
POST /api/duplikas/:id/sources         소스 등록
GET  /api/duplikas/:id/sources         소스 목록
DELETE /api/duplikas/:id/sources/:id   소스 삭제
POST /api/duplikas/:id/sources/crawl   크롤링 트리거
GET  /api/duplikas/:id/crawl-status    크롤링 상태
GET  /api/duplikas/:id/knowledge       인덱싱된 청크
```

**완료 조건:**
- 메시지 → 컨텍스트 기반 응답 테스트 통과
- 소스 등록 → 크롤링 → 상태 조회 흐름 테스트 통과

---

## WS-6: 프론트엔드 페이지 연동

**의존:** WS-1 + WS-2 (CRUD), WS-5 (채팅)

mock 데이터를 실제 API 호출로 전환 + 신규 관리 페이지 추가.

**산출물:**
- `client/src/lib/api.ts` — API 헬퍼 함수
- `client/src/hooks/use-auth.ts` — 인증 훅
- `client/src/hooks/use-duplikas.ts` — 듀플리카 + 서브리소스 React Query 훅
- `client/src/hooks/use-chat.ts` — 채팅 훅
- `client/src/components/route-guard.tsx` — 인증 라우트 가드
- `client/src/pages/auth.tsx` — 로그인/회원가입 페이지
- `client/src/pages/*.tsx` — 기존 페이지 API 전환
- `client/src/App.tsx` — 라우트 가드 적용 + 신규 라우트

**전환 대상:**
```
home.tsx           MOCK_DUPLIKAS → GET /api/duplikas
create.tsx         시뮬레이션 → POST /api/duplikas
dashboard.tsx      하드코딩 → GET /api/duplikas/:id
chat.tsx           PERSONAS → POST /api/chat/:id/message
my-profile.tsx     시뮬레이션 → PUT /api/duplikas/:id
my-info.tsx        INITIAL_FACTS/QA → Facts/QA API
topics-to-avoid    하드코딩 → Topics API
shareable-links    INITIAL_LINKS → Links API
keyword-responses  MOCK_KEYWORDS → Keywords API
profile-view.tsx   PROFILES → GET /api/public/profiles/:handle
```

**완료 조건:**
- Claude MCP 브라우저로 E2E 플로우 테스트
  - 회원가입 → 로그인 → 듀플리카 생성 → 대시보드 → 채팅
  - 각 설정 페이지 CRUD 동작
- 신규 페이지 렌더링 확인

---

## 전체 TODO (순서 및 의존성)

### Phase 1 — 기반 (선행)
| # | 작업 | 워크스트림 | 의존 |
|---|------|----------|------|
| 1 | `shared/schema.ts`에 12개 테이블 정의 | WS-0 | 없음 |
| 2 | pgvector 확장 활성화 | WS-0 | 없음 |
| 3 | `npm run db:push` 마이그레이션 실행 | WS-0 | #1, #2 |
| 4 | vitest + supertest 설치 및 설정 | WS-0 | 없음 |

### Phase 2 — 병렬 개발 (WS-0 이후 동시 착수)
| # | 작업 | 워크스트림 | 의존 |
|---|------|----------|------|
| 5 | Passport 전략 + 세션 미들웨어 설정 | WS-1 | #3 |
| 6 | 인증 API 라우트 구현 (register/login/logout/me) | WS-1 | #5 |
| 7 | IStorage → DatabaseStorage 전환 (유저) | WS-1 | #3 |
| 8 | 인증 테스트 작성 + 통과 | WS-1 | #6, #7 |
| 9 | 듀플리카 CRUD 라우트 구현 | WS-2 | #3 |
| 10 | Facts/Q&A CRUD 라우트 구현 | WS-2 | #3 |
| 11 | Topics/Links/Keywords CRUD 라우트 구현 | WS-2 | #3 |
| 12 | Public profile + Stats + Conversations API | WS-2 | #3 |
| 13 | 듀플리카 + 서브리소스 테스트 작성 + 통과 | WS-2 | #9~#12 |
| 14 | YouTube 크롤러 구현 | WS-3 | #3 |
| 15 | Instagram 크롤러 구현 | WS-3 | #3 |
| 16 | CrawlResult 공통 타입 + 크롤러 테스트 | WS-3 | #14~#15 |
| 17 | chunker 구현 (RecursiveCharacterTextSplitter) | WS-4 | #3 |
| 18 | embedder 구현 (Ollama/OpenAI) | WS-4 | #3 |
| 19 | vectorStore 구현 (pgvector INSERT/검색) | WS-4 | #3 |
| 20 | PDF 파서 구현 (pdf-parse) | WS-4 | #17 |
| 21 | BullMQ Worker 진입점 (worker/index.ts) | WS-4 | #17~#20 |
| 22 | 파이프라인 테스트 작성 + 통과 | WS-4 | #17~#21 |

### Phase 3 — 통합 (Phase 2 의존)
| # | 작업 | 워크스트림 | 의존 |
|---|------|----------|------|
| 23 | RAG 채팅 API 구현 (벡터 검색 + LLM) | WS-5 | #16, #22 |
| 24 | 소스/크롤링 관리 API 구현 | WS-5 | #16, #22 |
| 25 | 대화 내역 저장/조회 구현 | WS-5 | #23 |
| 26 | RAG 테스트 작성 + 통과 | WS-5 | #23~#25 |

### Phase 4 — 프론트 연동 (Phase 2+3 의존)
| # | 작업 | 워크스트림 | 의존 |
|---|------|----------|------|
| 27 | API 훅 + 인증 컨텍스트 + 라우트 가드 | WS-6 | #8, #13 |
| 28 | 기존 페이지 mock → API 전환 (CRUD 부분) | WS-6 | #27 |
| 29 | 채팅 페이지 API 연동 | WS-6 | #26, #27 |
| 30 | 신규 페이지 추가 (소스/크롤링/지식베이스) | WS-6 | #26, #27 |
| 31 | E2E UI 플로우 테스트 (MCP 브라우저) | WS-6 | #28~#30 |

---

## 테스트 전략

| 워크스트림 | 도구 | 범위 |
|-----------|------|------|
| WS-0 | `npm run db:push` + SQL 쿼리 | 테이블 생성 확인 |
| WS-1 | vitest + supertest | 인증 흐름 유닛/통합 |
| WS-2 | vitest + supertest | CRUD 엔드포인트 |
| WS-3 | vitest | 크롤러 유닛 (mock HTTP) |
| WS-4 | vitest | 청킹/임베딩/벡터/PDF 유닛 |
| WS-5 | vitest + supertest | RAG 통합 |
| WS-6 | Claude MCP 브라우저 | E2E UI 플로우 |

**규칙:** 모든 워크스트림은 테스트 통과 후 완료 처리. `npm test`로 전체 검증.

---

## 배포 전 수동 체크리스트 (사람이 해야 할 일)

코드 개발은 에이전트 팀이 완료했습니다. 아래는 **사람이 직접** 수행해야 하는 작업입니다.

### 1단계: 외부 서비스 설정

- [ ] **Railway 계정 생성** — https://railway.app (GitHub 연동 로그인)
- [ ] **Railway 프로젝트 생성** — New Project → Empty Project
- [ ] **PostgreSQL 추가** — Add Plugin → PostgreSQL
  - [ ] pgvector extension 활성화: Railway 콘솔에서 `CREATE EXTENSION IF NOT EXISTS vector;` 실행
- [ ] **Redis 추가** — Add Plugin → Redis
- [ ] **Web Service 추가** — Add Service → GitHub Repo → `Duplika-ver10` 선택
  - Build command: `npm run build`
  - Start command: `npm start`

### 2단계: 환경변수 설정 (Railway Web Service)

- [ ] `DATABASE_URL` — PostgreSQL 플러그인에서 자동 생성된 URL 복사
- [ ] `REDIS_URL` — Redis 플러그인에서 자동 생성된 URL 복사
- [ ] `SESSION_SECRET` — 랜덤 문자열 설정 (예: `openssl rand -hex 32`로 생성)
- [ ] `NODE_ENV` — `production`

### 3단계: DB 스키마 배포

- [ ] 로컬에서 `DATABASE_URL` 환경변수 설정 후 `npm run db:push` 실행
  ```bash
  export DATABASE_URL=<Railway PostgreSQL URL>
  npm run db:push
  ```
- [ ] 테이블 12개 생성 확인 (Railway 콘솔 또는 psql로)

### 4단계: Worker 로컬 환경 구성

Worker는 로컬 머신에서 실행합니다 (Ollama가 로컬 GPU 필요).

- [ ] **Ollama 설치** — https://ollama.com/download
  - macOS: `brew install ollama`
  - Linux: `curl -fsSL https://ollama.com/install.sh | sh`
- [ ] **Ollama 서버 시작** — `ollama serve` (백그라운드 실행, 기본 포트 11434)
- [ ] **임베딩 모델 다운로드** — `ollama pull nomic-embed-text`
  - 이 모델이 768차원 벡터를 생성하며, DB 스키마의 `vector(768)`과 일치
  - 모델 크기: 약 274MB
- [ ] **(선택) LLM 모델 다운로드** — `ollama pull llama3`
  - RAG 채팅 응답 생성에 사용
  - 모델 크기: 약 4.7GB
  - 또는 `OPENAI_API_KEY` 설정으로 OpenAI 사용 가능
- [ ] **Worker 환경변수 설정**
  ```bash
  export DATABASE_URL=<Railway PostgreSQL URL>
  export REDIS_URL=<Railway Redis URL>
  export OLLAMA_URL=http://localhost:11434
  # (선택) OpenAI 사용 시:
  # export OPENAI_API_KEY=sk-...
  ```
- [ ] **Worker 실행** — `npm run dev:worker`
  - BullMQ 큐(`crawl-pipeline`)를 리스닝하며 크롤링→청킹→임베딩→저장 처리
  - 웹 서비스와 별도 터미널에서 실행

### 5단계: 배포 확인

- [ ] Railway Web Service 배포 완료 확인 (도메인 URL 발급됨)
- [ ] `https://<your-domain>/api/auth/me` 접속 → 401 응답 확인
- [ ] 회원가입 테스트 (POST /api/auth/register)
- [ ] 로그인 후 듀플리카 생성 테스트
- [ ] Worker 동작 확인: 콘텐츠 소스 등록 → 터미널에서 Worker 로그 확인

### 6단계: (선택) 커스텀 도메인 + HTTPS

- [ ] Railway Settings → Custom Domain 설정
- [ ] DNS CNAME 레코드 추가
- [ ] HTTPS 자동 적용 확인

---

### Ollama 관련 FAQ

| 질문 | 답변 |
|------|------|
| Ollama를 반드시 설치해야 하나요? | **Worker를 돌리려면 필수.** 임베딩 생성(nomic-embed-text)과 RAG 응답 생성(llama3)에 사용됩니다. |
| OpenAI로 대체 가능한가요? | **임베딩은 가능** — `OPENAI_API_KEY` 설정하고 `OLLAMA_URL` 미설정 시 자동으로 OpenAI `text-embedding-3-small` 사용. **LLM도 가능** — `server/services/rag.ts`에서 `OPENAI_API_KEY` 설정 시 OpenAI 사용. |
| GPU가 없으면요? | Ollama는 CPU에서도 동작하지만 느림. OpenAI API 사용을 권장. |
| Worker 없이 앱이 동작하나요? | **기본 기능은 동작** — 회원가입, 듀플리카 생성, Facts/Q&A 관리 등 CRUD는 Worker 없이 가능. **채팅과 콘텐츠 크롤링은 불가** — 이 기능은 Worker + 임베딩이 필요. |
| Ollama 모델은 어떤 것을 받아야 하나요? | `nomic-embed-text` (필수, 임베딩용 274MB) + `llama3` (선택, 채팅 응답용 4.7GB). |
| Worker는 항상 켜둬야 하나요? | 콘텐츠 소스 등록/크롤링 시에만 필요. 평소에는 꺼놔도 기존 임베딩으로 채팅 가능 (단, RAG 서비스에 Ollama/OpenAI 연결 필요). |

---

### 비용 요약

| 항목 | 비용 | 비고 |
|------|------|------|
| Railway Hobby Plan | 무료 $5/월 크레딧 | PostgreSQL + Redis + Web Service |
| Ollama (로컬) | 무료 | 로컬 GPU/CPU 사용 |
| OpenAI API (선택) | 사용량 과금 | Ollama 대신 사용 시 |
| 커스텀 도메인 | 도메인 비용만 | Railway HTTPS 무료 |
