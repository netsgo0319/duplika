# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Duplika is a mobile-first platform for creating AI clones ("duplikas") of content creators. Users can set up personas with custom profiles, knowledge bases, keyword responses, and topic restrictions, then chat with these AI personas.

## Commands

```bash
npm run dev           # Start dev server (Express + Vite HMR) on port 5000
npm run dev:client    # Client-only Vite dev server on port 5000
npm run build         # Production build (client → dist/public, server → dist/index.cjs)
npm start             # Run production server
npm run check         # TypeScript type checking
npm run dev:worker    # Start BullMQ worker (로컬 실행, Redis+DB 필요)
npm run db:push       # Push Drizzle schema migrations to PostgreSQL
```

## Architecture

**Fullstack SPA** — Single Express server (port 5000) serves both the API and the Vite-built React client.

### Frontend (`client/src/`)
- **React 19 + TypeScript** with **Vite 7** as build tool
- **Wouter** for client-side routing (lightweight, not React Router)
- **TanStack React Query** for server state — configured with `staleTime: Infinity`, no auto-refetch, no retry. Use `apiRequest()` from `@/lib/queryClient` for mutations
- **Tailwind CSS 4** + **Radix UI / Shadcn** component library in `components/ui/`
- **Framer Motion** for page transitions and animations
- Pages live in `client/src/pages/`, one file per route

### Backend (`server/`)
- **Express 4** with JSON body parsing (includes raw body capture for webhooks)
- API routes go in `server/routes.ts`, prefixed with `/api`
- **Storage interface** (`server/storage.ts`): `IStorage` defines CRUD methods. Currently uses `MemStorage` (in-memory). Ready to swap to PostgreSQL via Drizzle ORM
- Request logging middleware auto-logs all `/api` calls with timing

### Shared (`shared/`)
- **Drizzle ORM** schema definitions + **Zod** validation schemas
- Types are inferred from schema (`User`, `InsertUser`)
- PostgreSQL via `DATABASE_URL` env var

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

### Key Patterns
- **Mobile-first layout**: All pages render inside a 480px max-width container (`components/layout/mobile-container.tsx`)
- **Multi-step wizard**: The create flow (`pages/create.tsx`) uses step-based state with Framer Motion transitions
- In development, Vite runs as Express middleware (not a separate process). In production, pre-built static files are served from `dist/public` with SPA fallback

### Worker (`worker/`) — 배치 파이프라인
- **BullMQ** Worker로 크롤링/파싱 → 청킹 → 임베딩 → 벡터 저장 처리
- Express와 별도 프로세스로 **로컬 머신에서 실행** (Railway에 올리지 않음)
- Railway PostgreSQL/Redis에 `DATABASE_URL`, `REDIS_URL`로 원격 접속
- **Ollama** (로컬)로 임베딩 생성 — 향후 서비스 확장 시 Railway Worker로 이전
- 지원 소스: **YouTube** (자막 추출), **Instagram** (포스트), **PDF** (텍스트 추출)

### Client Routes
```
/login               → Login / Register
/                    → Home (duplika list)
/create              → Multi-step creation wizard
/dashboard/:id       → Duplika management
/chat/:id            → Chat interface
/profile/:id         → Public profile view
/my-profile          → Edit profile
/my-info             → Facts & Q&A management
/topics-to-avoid     → Restricted topics
/shareable-links     → Social media links
/keyword-responses   → Keyword-triggered responses
```

## Testing

```bash
npm test                              # 전체 테스트 실행
npm test -- tests/auth.test.ts        # 특정 테스트 파일 실행
npm test -- tests/crawlers/           # 디렉토리 내 테스트 실행
```

- 테스트 프레임워크: **vitest** + **supertest** (API 통합 테스트)
- 프론트엔드 E2E: Claude MCP 브라우저 도구로 UI 플로우 확인
- **모든 기능은 테스트 통과 후 완료 처리** — 개발 완료 시 항상 `npm test`로 검증

## Documentation

```
docs/
├── architecture.md                   # 시스템 아키텍처, 배포 매핑, 기술 스택, API 전체 목록
├── PRD.md                            # 프로덕트 요구사항, 유저스토리, acceptance criteria
└── plans/
    └── 260207_Parallel_Units.md      # 병렬 워크스트림(WS-0~6), 전체 TODO, 테스트 전략
```

## Development Workstreams

개발은 `docs/plans/260207_Parallel_Units.md`에 정의된 워크스트림(WS-0~6) 단위로 진행.
WS-0(DB 스키마) 완료 후 WS-1~4는 dependency 없이 병렬 착수 가능.

배포: **Railway** (Web Service + PostgreSQL + Redis) / **Worker + Ollama는 로컬 실행**
아키텍처 상세: `docs/architecture.md` 참조
