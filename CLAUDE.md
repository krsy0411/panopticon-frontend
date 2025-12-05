# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panopticon is an APM (Application Performance Monitoring) dashboard for distributed systems. It provides real-time metrics monitoring, distributed tracing visualization, SLO-based alerts, and multi-channel notifications (Slack, Discord, Teams, Email).

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:ci      # Run ESLint with strict mode (--max-warnings=0)
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run typecheck    # TypeScript type check
npm run check:all    # Run all checks (lint:ci + format:check:ci + typecheck)
```

Docker development: `docker-compose up -d`

## Architecture

### Tech Stack
- Next.js 16 with App Router
- React 19, TypeScript
- Zustand (global state), TanStack Query (server state)
- Tailwind CSS 4, ECharts, Framer Motion
- Socket.io for real-time updates

### Directory Structure

**app/**: Next.js App Router pages
- `(authenticated)/` - Protected routes requiring login
- `(authenticated)/services/[serviceName]/` - Service detail pages with sections (Overview, Traces, Logs, Resources)
- `auth/` - Authentication pages

**components/**: React components
- `analysis/` - Trace analysis views (Waterfall, FlameGraph, Map, SpanList)
- `features/` - Feature-specific components (services, install guides, notifications)
- `ui/` - Reusable UI components (Button, Table, SlideOverLayout, PullUpPanelLayout)
- `common/` - Shared components (Header, EndpointBarChart, LogGroups)

**src/**: Core application code
- `api/` - API client functions (apm.ts, auth.ts, slo.ts, webhook.ts)
- `hooks/` - Custom hooks (useAuth, useSloMetricsMonitoring, useErrorLogsWebSocket)
- `store/` - Zustand stores (timeRangeStore with polling intervals)
- `providers/` - React context providers (QueryProvider, AlarmProvider)
- `utils/` - Utility functions (timeRange, chartFormatter, sloCalculations)

**types/**: TypeScript type definitions (apm.ts, notification.ts, servicelist.ts)

### Key Patterns

**Import Aliases**: Use `@/` for absolute imports from project root (e.g., `@/components/ui/Button`)

**Time Range Management**: `useTimeRangeStore` (Zustand) manages global time range state with configurable polling intervals:
- `POLLING_MAIN_INTERVAL`: 1.5s for main dashboards
- `POLLING_DETAIL_INTERVAL`: 5s for detail views

**API Layer**: Functions in `src/api/` return typed responses and use a common `fetchJson` helper. API base URL comes from `NEXT_PUBLIC_API_BASE_URL` env var.

**Provider Hierarchy** (app/layout.tsx): QueryProvider > AlarmProvider > OverlayStackProvider > ToastContainer

**Trace Analysis Views**: TraceAnalysis component displays distributed traces in multiple views (Waterfall, Map, FlameGraph, SpanList) using a slide-over panel pattern.

## Conventions

### Git Workflow
- Branch naming: `feature/`, `fix/`, `refactor/`, `test/`
- Commits: Conventional Commits format `[type(scope)]: subject`
- Types: feat, fix, docs, style, refactor, test, chore, perf

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` - APM API server
- `NEXT_PUBLIC_AUTH_API_BASE_URL` - Auth server
