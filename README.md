# Delivery Admin Panel

A comprehensive monorepo project for managing delivery operations, consisting of a backend REST API and a frontend admin panel web application.

## 🚀 Tech Stack

This project is built using modern web development technologies and follows a monorepo architecture managed by **Turborepo**.

### **Infrastructure & Monorepo**
- **Turborepo** - High-performance build system for JavaScript and TypeScript codebases.
- **npm Workspaces** - Package management across multiple apps and shared packages.
- **Docker & Docker Compose** - Containerized database and PGAdmin setup for local development.

### **Backend (`apps/api`)**
- **NestJS** - Progressive Node.js framework for building efficient and scalable server-side applications.
- **PostgreSQL** - Relational database.
- **Prisma ORM** - Next-generation Node.js and TypeScript ORM for database access and migrations.
- **Authentication** - JWT (JSON Web Tokens) with Passport.js, and Bcrypt for password hashing.
- **Class Validator & Class Transformer** - For robust DTO validation.

### **Frontend (`apps/web`)**
- **React (v19)** - JavaScript library for building user interfaces.
- **Vite** - Next-generation frontend tooling for ultra-fast development server and optimized build.
- **Tailwind CSS (v4)** - Utility-first CSS framework for rapid UI development.
- **React Router DOM** - Declarative routing for React web applications.
- **Lucide React** - Beautiful and consistent icons.

---

## 📂 Project Structure

```text
delivery-admin-panel/
├── apps/
│   ├── api/          # NestJS backend application
│   └── web/          # React + Vite frontend application
├── packages/
│   ├── ui/               # Shared React UI components (if applicable)
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TypeScript configuration
├── docker-compose.yml    # PostgreSQL and PGAdmin local setup
└── package.json          # Root workspace configuration
```

---

## 🛠️ Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **npm** (v11+)
- **Docker** and **Docker Compose**

### 1. Clone the repository and install dependencies

From the root of the standard monorepo folder, install all necessary dependencies for both the frontend and backend:

```bash
npm install
```

### 2. Set up the Database

The project uses Docker Compose to easily spin up a PostgreSQL database and PGAdmin (for database management).

Start the database services in the background:

```bash
docker-compose up -d
```

> **Note:** The database will be available on `localhost:5050` with the user `postgres`, password `postgres123`, and database name `delivery_admin_db` (as configured in the `docker-compose.yml`).
> PGAdmin is available at `localhost:5051` (Login: `admin@admin.com` / `admin`).

### 3. Configure Environment Variables

You need to set up environment variables for the API to connect to the database.

1. Navigate to the `apps/api` directory:
   ```bash
   cd apps/api
   ```
2. Create a `.env` file based on `.env.example` (if one exists), or simply provide the `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres123@localhost:5050/delivery_admin_db?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   ```

### 4. Database Migrations

Use Prisma to push the schema to your fresh database and generate the Prisma Client. 
From the `apps/api` folder:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the Development Servers

You can start both the frontend and backend simultaneously from the root of the project using Turborepo:

Navigate back to the root directory and run:

```bash
npm run dev
```
*(Or use `turbo run dev`)*

This command will start:
- The **NestJS API** (usually on `http://localhost:3000`)
- The **React Web App** (usually on `http://localhost:5173`)

### Alternatively: Running Apps Individually

If you only want to run a specific part of the application:
- **Backend only:** `cd apps/api` and run `npm run start:dev`
- **Frontend only:** `cd apps/web` and run `npm run dev`

---

## 📜 Available Scripts (Root)

From the root directory, you can run the following Turborepo scripts:

- `npm run dev` - Starts development servers for all apps.
- `npm run build` - Builds all apps and packages for production.
- `npm run lint` - Runs ESLint across the monorepo to check for code quality issues.
- `npm run format` - Formats all code using Prettier.
- `npm run check-types` - Runs TypeScript compiler checks without emitting files.

---

## 📦 Production Build

To prepare the application for production, you can build all packages and applications from the root:

```bash
npm run build
```

- The API production build will be output to `apps/api/dist/`.
- The Web production build will be output to `apps/web/dist/`.

To start them individually in a production-like setting:
- **API:** `cd apps/api && npm run start:prod`
- **Web:** `cd apps/web && npm start` (uses the `serve` package configured in `package.json`)
