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
- `trust proxy` 활성화 — Railway 등 리버스 프록시 뒤에서 정상 동작
- API routes go in `server/routes.ts`, prefixed with `/api`
- **Storage**: `DATABASE_URL` 있으면 `DatabaseStorage`(PostgreSQL), 없으면 `MemStorage`(메모리)
- **세션**: `connect-pg-simple`로 PostgreSQL에 저장 (프로세스 재시작에도 유지). DB 없으면 MemoryStore
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
/my-profile/:id      → Edit profile
/my-info/:id         → Facts & Q&A management
/content-sources/:id → YouTube/Instagram/PDF source management
/topics-to-avoid/:id → Restricted topics
/shareable-links/:id → Social media links
/keyword-responses/:id → Keyword-triggered responses
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

## Production / Deployment Checklist

Railway 배포 시 반드시 확인:

1. **`trust proxy`**: Express가 Railway 리버스 프록시를 신뢰하도록 `app.set('trust proxy', 1)` 필수
2. **세션 쿠키**: 프로덕션에서 `secure: true` 설정. HTTPS 없이는 쿠키가 전달되지 않음
3. **세션 저장소**: `connect-pg-simple`로 PostgreSQL에 저장. MemoryStore는 프로세스 재시작 시 세션 소멸
4. **환경변수**: `DATABASE_URL`, `REDIS_URL`, `SESSION_SECRET`, `SLACK_WEBHOOK_URL`, `NODE_ENV=production`
5. **DB 마이그레이션**: 스키마 변경 후 `npm run db:push` 실행 필수

## Agent Team Guidelines

에이전트 팀으로 병렬 작업 시 반드시 지켜야 할 규칙:

1. **모듈 간 접점(seam) 검증**: 두 에이전트가 각각 만든 코드의 **인터페이스가 일치하는지** 반드시 확인. 예: 큐에 넣는 데이터 형태와 워커가 받는 데이터 형태가 같은지
2. **End-to-End 흐름 리뷰**: 단위 테스트만으로는 부족. 리뷰 시 데이터가 **입력 → 처리 → 저장까지 전체 경로**를 통과하는지 추적
3. **UI ↔ API 연결 확인**: 프론트엔드에 UI 요소(버튼, 아이콘 등)를 만들면 반드시 **기능 코드(onClick, API 호출 등)도 함께 구현**. 디자인만 있고 기능이 없는 스텁은 TODO 주석으로 명시
4. **공유 인터페이스 문서화**: 여러 에이전트가 공유하는 인터페이스(큐 job 데이터, API 요청/응답 형태 등)는 `shared/types.ts`에 명시하고, 변경 시 양쪽 모두 업데이트
5. **프로덕션 환경 고려**: 로컬에서 동작해도 프로덕션(리버스 프록시, HTTPS, DB 세션)에서 다르게 동작할 수 있음. 세션/쿠키/CORS 설정 반드시 프로덕션 조건으로 검증
