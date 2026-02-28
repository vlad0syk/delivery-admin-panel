# Delivery Admin Panel

A comprehensive monorepo project for managing delivery operations, including orders with tax calculations, geolocation-based tax regions, and CSV/PDF import capabilities. The project consists of a NestJS backend REST API and a React frontend admin panel.

## Live Demo

**Deployed application:** [https://delivery-admin-panel-web.vercel.app/](https://delivery-admin-panel-web.vercel.app/)

### Demo Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `test@gmail.com` |
| **Password** | `Test123456` |

---

## Tech Stack

This project is built using modern web development technologies and follows a monorepo architecture managed by **Turborepo**.

### Infrastructure & Monorepo

| Technology | Version | Description |
|------------|---------|-------------|
| **Turborepo** | 2.8.x | High-performance build system for JavaScript and TypeScript monorepos |
| **npm Workspaces** | 11.8.x | Package management across multiple apps and shared packages |
| **Docker** | — | Containerized PostgreSQL and PGAdmin for local development |
| **Docker Compose** | 3.8 | Orchestration for database services |

### Backend (`apps/api`)

| Technology | Version | Description |
|------------|---------|-------------|
| **NestJS** | 11.x | Progressive Node.js framework for scalable server-side applications |
| **TypeScript** | 5.9.x | Strongly typed JavaScript |
| **PostgreSQL** | 14 | Relational database |
| **Prisma ORM** | 6.6.x | Next-generation Node.js and TypeScript ORM |
| **Passport.js** | 0.7.x | Authentication middleware |
| **JWT** | — | JSON Web Tokens for stateless authentication |
| **Bcrypt** | 6.x | Password hashing |
| **class-validator** | 0.14.x | DTO validation decorators |
| **class-transformer** | 0.5.x | Object transformation and serialization |
| **pdf-parse** | 2.4.x | PDF parsing for order import |
| **cookie-parser** | 1.4.x | Cookie parsing middleware |

### Frontend (`apps/web`)

| Technology | Version | Description |
|------------|---------|-------------|
| **React** | 19.2.x | UI library for building interfaces |
| **Vite** | 7.3.x | Fast build tool and dev server |
| **TypeScript** | 5.9.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.2.x | Utility-first CSS framework |
| **React Router DOM** | 7.9.x | Declarative routing |
| **Lucide React** | 0.575.x | Icon library |

### Shared Packages (`packages/`)

| Package | Description |
|---------|-------------|
| `@repo/ui` | Shared React UI components |
| `@repo/eslint-config` | Shared ESLint configuration |
| `@repo/typescript-config` | Shared TypeScript configuration |

---

## Features

- **Authentication** — JWT-based login with HTTP-only cookies and session persistence
- **Orders Management** — Create, read, update, delete orders with full CRUD support
- **Tax Calculation** — Automatic tax calculation based on geolocation (latitude/longitude) and tax rate regions
- **Import** — CSV and PDF import for bulk order creation
- **Statistics** — Dashboard with total orders, tax collected, average tax rate
- **Filtering & Sorting** — Filter by date range, subtotal, tax amount, tax region; sort by any column
- **Pagination** — Server-side pagination for large datasets
- **Responsive UI** — Mobile-friendly layout with adaptive tables and cards

---

## Project Structure

```text
delivery-admin-panel/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/
│   │   │   ├── migrations/     # Database migrations
│   │   │   ├── schema.prisma   # Prisma schema
│   │   │   └── seed.ts         # Database seed (test user)
│   │   └── src/
│   │       ├── auth/           # Authentication module
│   │       ├── orders/         # Orders module
│   │       └── main.ts
│   └── web/                    # React + Vite frontend
│       ├── src/
│       │   ├── app/            # Pages and layouts
│       │   ├── components/     # UI components
│       │   ├── provider/       # React context providers
│       │   └── routes/         # Routing configuration
│       ├── vercel.json         # Vercel SPA routing
│       └── vite.config.ts
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # Shared ESLint config
│   └── typescript-config/      # Shared TS config
├── docker-compose.yml          # PostgreSQL + PGAdmin
├── turbo.json                  # Turborepo config
└── package.json                # Root workspace
```

---

## Getting Started

### Prerequisites

- **Node.js** — v18 or higher (LTS recommended)
- **npm** — v11 or higher
- **Docker** and **Docker Compose** — for local PostgreSQL and PGAdmin

### 1. Clone the Repository

```bash
git clone https://github.com/vlad0syk/delivery-admin-panel.git
cd delivery-admin-panel
```

### 2. Install Dependencies

From the project root, install dependencies for all workspaces:

```bash
npm install
```

### 3. Set Up the Database

Start PostgreSQL and PGAdmin with Docker Compose:

```bash
docker-compose up -d
```

**Database connection details:**

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5050` |
| User | `postgres` |
| Password | `postgres123` |
| Database | `delivery_admin_db` |

**PGAdmin (optional):**

| Setting | Value |
|---------|-------|
| URL | `http://localhost:5051` |
| Email | `admin@admin.com` |
| Password | `admin` |

### 4. Configure Environment Variables

#### Backend (`apps/api`)

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5050/delivery_admin_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_change_in_production"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes (prod) | Secret for signing JWT tokens (defaults to dev secret if omitted) |
| `PORT` | No | API port (default: `3000`) |

#### Frontend (`apps/web`)

For **local development**, the frontend uses a Vite proxy (`/api` → backend). No env vars are needed if the API runs on the port configured in the proxy.

For **production** or **standalone** frontend builds, create `apps/web/.env`:

```env
VITE_API_URL=https://your-api-url.com
```

> **Port alignment for local dev:** The Vite proxy (`/api`) targets `http://localhost:3001`. Add `PORT=3001` to `apps/api/.env` so the API runs on port 3001 and the proxy works. Alternatively, change the proxy target in `apps/web/vite.config.ts` to `http://localhost:3000` if you keep the API on the default port.

### 5. Database Migrations and Seed

From the project root or `apps/api`:

```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate
```

Seed the database with the test user:

```bash
npx prisma db seed
```

This creates the test user (`test@gmail.com` / `Test123456`).

### 6. Start Development Servers

From the project root:

```bash
npm run dev
```

This starts:

- **API** — `http://localhost:3000` (or `PORT` from env)
- **Web** — `http://localhost:5173`

Ensure the Vite proxy port in `apps/web/vite.config.ts` matches the API port. If the API runs on 3000, update the proxy target to `http://localhost:3000`.

---

## Running Apps Individually

| App | Command | URL |
|-----|---------|-----|
| Backend only | `cd apps/api && npm run start:dev` | `http://localhost:3000` |
| Frontend only | `cd apps/web && npm run dev` | `http://localhost:5173` |

---

## Available Scripts

### Root

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run lint` | Run ESLint across the monorepo |
| `npm run format` | Format code with Prettier |
| `npm run check-types` | Run TypeScript checks without emitting files |

### API (`apps/api`)

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start API with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests |

### Web (`apps/web`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run start` | Serve production build (uses `serve`) |

---

## Production Build

Build all apps:

```bash
npm run build
```

Outputs:

- **API** — `apps/api/dist/`
- **Web** — `apps/web/dist/`

Run in production:

- **API:** `cd apps/api && npm run start:prod`
- **Web:** `cd apps/web && npm start` (serves `dist/` on `$PORT`)

---

## Deployment

### Frontend (Vercel)

The web app is configured for Vercel with `apps/web/vercel.json`:

- SPA routing: all routes rewrite to `index.html`
- Environment: set `VITE_API_URL` to your API base URL

### Backend

The API can be deployed to any Node.js host (Railway, Render, Heroku, etc.) with:

- `DATABASE_URL` pointing to a PostgreSQL instance
- `JWT_SECRET` set to a secure random string
- CORS origins updated to include the frontend URL

---

## Database Schema Overview

- **User** — Authentication (id, email, password)
- **Order** — Orders with subtotal, total, tax, timestamp
- **Location** — Latitude, longitude, linked to TaxRateRegion
- **TaxRateRegion** — Composite, state, county, city, special rates
- **Jurisdiction** — Jurisdiction-level tax rates (state, county, city, special)

---