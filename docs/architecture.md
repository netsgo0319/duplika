# Duplika 아키텍처 및 배포

## 시스템 구조

```
┌─────────────────────────────────────────┐
│            Railway (클라우드)             │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Web Service                        │ │
│  │  Express API + React SPA            │ │
│  │  port 5000                          │ │
│  └──────────────┬─────────────────────┘ │
│                 │                        │
│  ┌──────────────▼─────────────────────┐ │
│  │  PostgreSQL Add-on (pgvector 확장)  │ │
│  └──────────────▲─────────────────────┘ │
│                 │                        │
│  ┌──────────────┴─────────────────────┐ │
│  │  Redis Add-on (또는 Upstash)        │ │
│  └──────────────▲─────────────────────┘ │
└─────────────────┼────────────────────────┘
                  │ DATABASE_URL / REDIS_URL (원격 접속)
┌─────────────────┼────────────────────────┐
│           로컬 머신                       │
│                 │                         │
│  ┌──────────────┴─────────────────────┐  │
│  │  BullMQ Worker                      │  │
│  │  크롤링 → 청킹 → 임베딩 → 벡터 저장  │  │
│  └──────────────┬─────────────────────┘  │
│                 │                         │
│  ┌──────────────▼─────────────────────┐  │
│  │  Ollama (nomic-embed-text, 768d)    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 방향성

**현재:** Worker + Ollama는 로컬 머신에서 실행. Railway 크레딧 절약.
**향후:** 서비스 확장 시 Worker를 Railway Worker Service로 이전, Ollama를 OpenAI Embedding API로 대체. 코드 변경 없이 환경변수만 교체.

---

## 배포 매핑

| 구성요소 | 배포 위치 | 환경변수 | 월 비용 |
|----------|----------|----------|---------|
| Express API + React SPA | Railway Web Service | `PORT`, `DATABASE_URL`, `REDIS_URL`, `OPENAI_API_KEY` | $0 (무료 크레딧) |
| PostgreSQL + pgvector | Railway Add-on | → `DATABASE_URL` | $0 |
| Redis | Railway Add-on / Upstash | → `REDIS_URL` | $0 |
| BullMQ Worker | **로컬** | `DATABASE_URL`, `REDIS_URL`, `OLLAMA_URL` | $0 |
| Ollama (임베딩) | **로컬** | `http://localhost:11434` | $0 |
| LLM (채팅 응답) | OpenAI API | `OPENAI_API_KEY` | ~$5~20 |

Railway 무료 한도: 월 $5 크레딧 (Worker 없으므로 여유)

---

## 3대 레이어

### 1. Express API Server (`server/`)

인증, 듀플리카 CRUD, RAG 채팅 쿼리 처리.

RAG 쿼리 플로우 (Express 내부, 네트워크 홉 없음):
```
유저 메시지 → 임베딩 → pgvector 유사도 검색 (top 5) → 프롬프트 구성 → LLM 호출 → 응답
```

### 2. Worker 파이프라인 (`worker/`)

인플루언서 콘텐츠를 수집하여 RAG용 벡터로 변환. BullMQ로 Express와 비동기 통신.

```
소스 등록 → 크롤링/파싱 → 텍스트 추출 → 청킹(500자) → 임베딩(768d) → pgvector 저장
```

| 콘텐츠 소스 | 라이브러리 |
|------------|-----------|
| YouTube | `youtube-transcript` (자막 추출) |
| Instagram | Instagram Basic Display API |
| PDF | `pdf-parse` (텍스트 추출) |

### 3. React 프론트엔드 (`client/src/`)

인플루언서 관리 페이지 + 채팅 UI.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19, Vite 7, Wouter, TanStack Query, Tailwind 4, Radix/Shadcn, Framer Motion |
| 백엔드 | Express 4, Drizzle ORM, Zod, Passport.js, express-session |
| 벡터/RAG | pgvector, Ollama (nomic-embed-text), LangChain.js (text splitter) |
| 파이프라인 | BullMQ, Redis, youtube-transcript, pdf-parse |
| LLM | OpenAI API (GPT-4o-mini) / Ollama 로컬 |

### 추가 필요 npm 패키지

```bash
# 벡터 검색
npm install pgvector

# 크롤링 + 파싱
npm install youtube-transcript pdf-parse

# 텍스트 처리 + 임베딩
npm install langchain @langchain/community ollama

# 작업 큐
npm install bullmq ioredis @bull-board/express @bull-board/api

# 테스트
npm install -D vitest supertest
```

---

## DB 테이블 (12개)

| 테이블 | 설명 |
|--------|------|
| `users` | 유저 인증 |
| `sessions` | express-session (connect-pg-simple) |
| `duplikas` | 듀플리카 프로필 (displayName, handle, bio, avatar, isPublic) |
| `facts` | 듀플리카별 팩트 정보 |
| `qa_pairs` | 듀플리카별 Q&A |
| `topics_to_avoid` | 금지 주제 |
| `shareable_links` | 공유 링크 |
| `keyword_responses` | 키워드 응답 |
| `conversations` | 대화 세션 |
| `messages` | 개별 메시지 |
| `content_sources` | 콘텐츠 소스 (youtube, instagram, pdf) |
| `content_chunks` | 텍스트 청크 + 벡터 임베딩 (pgvector) |

---

## 디렉토리 구조

```
Duplika-ver10/
├── client/src/
│   ├── pages/                    # 라우트 페이지
│   ├── components/
│   │   ├── chat/                 # 채팅 UI 컴포넌트
│   │   ├── layout/               # 레이아웃 래퍼 (480px 모바일)
│   │   └── ui/                   # Shadcn 컴포넌트 (50+)
│   ├── hooks/                    # 커스텀 훅 (use-auth, use-duplikas, use-chat)
│   ├── lib/                      # queryClient, api, utils
│   ├── App.tsx                   # 라우트 정의
│   └── main.tsx                  # React DOM 렌더
├── server/
│   ├── index.ts                  # Express 앱 진입점
│   ├── auth.ts                   # Passport 전략 + 세션 설정
│   ├── routes.ts                 # 라우트 등록
│   ├── routes/                   # 도메인별 라우트
│   │   ├── auth.ts               # 인증 API
│   │   ├── duplikas.ts           # 듀플리카 CRUD + 서브리소스
│   │   ├── public.ts             # 공개 프로필
│   │   ├── chat.ts               # 채팅 API
│   │   ├── content-sources.ts    # 소스 관리
│   │   └── crawl.ts              # 크롤링 트리거/상태
│   ├── storage.ts                # IStorage 인터페이스 + MemStorage + DatabaseStorage
│   ├── db.ts                     # Drizzle DB 연결
│   ├── vite.ts                   # 개발 Vite 미들웨어
│   └── static.ts                 # 프로덕션 정적 파일 서빙
├── worker/                        # 배치 파이프라인
│   ├── index.ts                  # BullMQ Worker 진입점
│   ├── crawlers/
│   │   ├── index.ts              # 크롤러 라우터
│   │   ├── youtube.ts            # YouTube 자막 크롤러
│   │   └── instagram.ts          # Instagram 크롤러
│   └── pipeline/
│       ├── chunker.ts            # 텍스트 청킹 (500자, 50자 오버랩)
│       ├── embedder.ts           # Ollama/OpenAI 임베딩
│       └── vectorStore.ts        # pgvector INSERT/검색
├── shared/
│   └── schema.ts                 # Drizzle 스키마 + Zod 검증 (12개 테이블)
├── tests/                         # vitest + supertest 테스트
├── docs/
│   ├── architecture.md           # 이 파일
│   ├── PRD.md                    # 프로덕트 요구사항 문서
│   └── plans/
│       └── 260207_Parallel_Units.md
└── CLAUDE.md
```

---

## API 전체 목록

### 인증 (4개)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### 듀플리카 관리 (7개)
```
POST   /api/duplikas
GET    /api/duplikas
GET    /api/duplikas/popular
GET    /api/duplikas/:id
PUT    /api/duplikas/:id
PUT    /api/duplikas/:id/visibility
DELETE /api/duplikas/:id
```

### 듀플리카 서브리소스 (18개)
```
GET/POST/PUT/DELETE  /api/duplikas/:id/facts(/:factId)
GET/POST/PUT/DELETE  /api/duplikas/:id/qa(/:qaId)
GET/POST/DELETE      /api/duplikas/:id/topics-to-avoid(/:topicId)
GET/POST/DELETE      /api/duplikas/:id/shareable-links(/:linkId)
GET/POST/PUT/DELETE  /api/duplikas/:id/keyword-responses(/:resId)
```

### 채팅 + RAG (3개)
```
POST   /api/chat/:duplikaId/message
GET    /api/chat/:duplikaId
GET    /api/duplikas/:id/conversations
```

### 소스/크롤링 관리 (5개)
```
POST   /api/duplikas/:id/sources
GET    /api/duplikas/:id/sources
DELETE /api/duplikas/:id/sources/:srcId
POST   /api/duplikas/:id/sources/crawl
GET    /api/duplikas/:id/crawl-status
```

### 기타 (3개)
```
GET    /api/duplikas/:id/knowledge
GET    /api/duplikas/:id/stats
GET    /api/public/profiles/:handle
```

**총 40개 엔드포인트**
