# Duplika - AI Digital Twin Platform

## Overview

Duplika is a mobile-first web application that allows users to create AI-powered digital twins (personas) that can engage in conversations on their behalf. Users upload personal data (PDFs, social media links) to train their AI clone, which then interacts with fans and followers using the creator's unique voice and knowledge base.

The platform targets content creators and influencers who want to scale their fan engagement through personalized AI conversations that maintain their authentic communication style.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **Build Tool**: Vite with custom plugins for Replit integration
- **Design Pattern**: Mobile-first responsive design with max-width container (480px)

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC)
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**:
  - `users` / `sessions` - Authentication (Replit Auth managed)
  - `duplikas` - AI persona profiles
  - `conversations` / `messages` - Chat history
  - `facts` / `qaPairs` - Training data for AI
  - `topicsToAvoid` / `keywordResponses` - Behavior configuration
  - `shareableLinks` - External content references

### Authentication Flow
- Uses Replit's OIDC provider for authentication
- Session tokens stored in PostgreSQL `sessions` table
- Protected routes use `isAuthenticated` middleware
- User data synced to local `users` table on login

### Build & Development
- Development: `npm run dev` starts Express server with Vite middleware
- Production: `npm run build` creates bundled output in `dist/`
- Database migrations: `npm run db:push` using Drizzle Kit

## External Dependencies

### Third-Party Services
- **Replit Auth**: Primary authentication provider via OIDC
- **PostgreSQL**: Database (provisioned through Replit)

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM with Zod schema validation
- `@tanstack/react-query`: Async state management
- `passport` / `openid-client`: Authentication handling
- `framer-motion`: Page transitions and animations
- `shadcn/ui` components: Pre-built accessible UI components

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required for auth)
- `ISSUER_URL`: OIDC provider URL (defaults to Replit)
- `REPL_ID`: Replit deployment identifier