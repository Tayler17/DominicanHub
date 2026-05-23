# Dominican Hub

**Digital commerce and logistics infrastructure for the Dominican Republic and the Caribbean diaspora.**

Dominican Hub is an integration-first marketplace platform — not a logistics company. It connects buyers, sellers, and existing logistics providers through a unified commerce layer.

---

## Architecture

```
Users (buyers, vendors, admins)
         ↕
    Dominican Hub
  ┌──────────────────────────────────────────┐
  │  Marketplace  │  Order Management        │
  │  Payments     │  Logistics Orchestration │
  │  Tracking     │  AI Support Layer        │
  └──────────────────────────────────────────┘
         ↕  (adapter interface)
  External Partners
  - Dominican Shipping (primary)
  - DHL / FedEx / UPS via Shippo
  - Warehouses (API or manual)
  - Customs brokers (email + portal)
  - Last-mile delivery partners
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### 1. Clone and install
```bash
git clone https://github.com/Tayler17/DominicanHub.git
cd DominicanHub
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your values
# Minimum required: DATABASE_URL, JWT_SECRET
```

### 3. Start the stack
```bash
docker compose up -d          # starts postgres + redis
cd apps/api
npx prisma migrate dev        # runs migrations
npx prisma db seed            # optional: seed test data
cd ../..
npm run dev                   # starts API + Web
```

### 4. Access the platform
| Service | URL |
|---------|-----|
| Web (marketplace) | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger docs | http://localhost:3001/docs |
| Adminer (DB) | http://localhost:8080 |

---

## Project Structure

```
dominican-hub/
├── apps/
│   ├── api/                  ← NestJS backend
│   │   ├── src/
│   │   │   ├── modules/      ← domain modules (auth, orders, etc.)
│   │   │   ├── logistics/    ← adapter interface + partner adapters
│   │   │   ├── ai/           ← chatbot + document generation
│   │   │   ├── queues/       ← BullMQ workers
│   │   │   └── common/       ← shared utilities
│   │   └── prisma/           ← schema + migrations
│   └── web/                  ← Next.js 14 frontend
│       └── src/
│           ├── app/          ← App Router pages
│           ├── components/   ← UI components
│           └── lib/          ← API client, i18n, auth
├── packages/
│   ├── types/                ← shared TypeScript types
│   └── utils/                ← shared utilities
└── infra/
    └── docker/               ← production Docker configs
```

## Adding a New Logistics Partner

1. Create `apps/api/src/logistics/adapters/{partner-name}/{partner-name}.adapter.ts`
2. Implement the `LogisticsAdapter` interface
3. Register it in `adapter.registry.ts`
4. Add credentials to `.env`

The platform will automatically show the new partner in the admin panel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Cache / Queues | Redis 7 + BullMQ |
| Payments | Stripe Connect |
| Notifications | SendGrid + WhatsApp Business API |
| AI | Anthropic Claude / OpenAI |
| Infrastructure | Docker, GitHub Actions |

## Build Phases

- **Phase 1** (Weeks 1–7): Marketplace core — auth, products, checkout, Stripe
- **Phase 2** (Weeks 8–14): Logistics integration — adapters, tracking, WhatsApp notifications
- **Phase 3** (Weeks 15–21): Commissions, customs docs, AI chatbot
- **Phase 4** (Weeks 22+): Scale, automation, mobile apps, B2B portal
