# Spur AI Live Chat Agent

A robust, modular live chat support widget powered by an LLM (OpenAI) and optimized for performance with Redis caching.

## How to Run Locally

### Prerequisites
* **Node.js 23+**
* **pnpm** (recommended) or npm
* **Redis** (running locally or via a single Docker container)

### Step 1: Start Redis
The application requires a running Redis instance for caching and rate limiting.  
If you have Docker installed, run:
```bash
docker run -d -p 6379:6379 redis:latest
```
Alternatively, install Redis directly on your OS and ensure it is running on port 6379.

### Step 2: Backend Setup
Navigate to the backend folder:
```bash
cd backend
```

Install dependencies:
```bash
pnpm install
```

Create a `.env` file in `backend/`:
```ini
PORT=3000

# Your OpenAI API Key (Required)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx

# Token limit for the LLM
MAX_TOKEN=200

# Redis Connection String
REDIS_URL=redis://localhost:6379
```

Start the server:
```bash
pnpm run dev
```

The server will start at http://localhost:3000.

### Step 3: Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
pnpm install
```

Create a `.env` file in `frontend/`:
```ini
# Points to your running backend
PUBLIC_API_URL=http://localhost:3000
```

Start the development server:
```bash
pnpm run dev
```

Open your browser to http://localhost:5173.

## 🗄️ Database Setup (SQLite)

**Zero-Config:** The application uses `better-sqlite3` (SQLite).

**Auto-Migrations:** You do not need to run any migration scripts.

On server startup, the `repository.ts` module automatically checks for the `chat.db` file.

If missing, it automatically executes the SQL to create the `conversations` and `messages` tables.

**Seeding:** No seeding is required. A new session ID is generated automatically when you start chatting.

## 🔑 Environment Configuration

### Backend (`backend/.env`)

| Variable        | Description                          | Required | Default                 |
|-----------------|--------------------------------------|----------|-------------------------|
| OPENAI_API_KEY | API Key for GPT-4o/3.5 models        | Yes      | -                       |
| REDIS_URL      | Redis connection string              | No       | redis://localhost:6379 |
| MAX_TOKEN      | Max tokens for LLM response          | No       | 300                     |
| PORT           | Server port                          | No       | 3000                    |

### Frontend (`frontend/.env`)

| Variable        | Description            | Required | Default                 |
|-----------------|------------------------|----------|-------------------------|
| PUBLIC_API_URL | URL of the Backend API | Yes      | http://localhost:3000 |

## 🏗️ Architecture Overview

The system follows a strict separation of concerns to ensure maintainability and testability.

### Backend Structure (Modular Monolith)

- **Controllers (`/controllers`)**  
  Handles HTTP requests, input validation (zod/sanitization), and response formatting.

- **Services (`/services`)**  
  Contains the core business logic.
  - `llm.service.ts`: Manages OpenAI integration, retry logic, and prompt engineering.
  - `cache.service.ts`: Handles semantic caching (hashing questions to retrieve stored answers).

- **Repository (`/db`)**  
  Direct database access layer using `better-sqlite3`. Encapsulates all SQL queries.

### Frontend Structure (SvelteKit)

- **State Management:**  
  Uses Svelte 5 Runes (`$state`, `$effect`) via a centralized `chat.svelte.ts` class.

- **UI Components:**  
  Built with Shadcn UI (Tailwind CSS) for accessibility and modularity.

- **Type Safety:**  
  Shared TypeScript interfaces ensure the frontend is strictly typed against the API response shape.

## Design Decisions

- **Semantic Caching:**  
  We hash user questions (normalized) and store LLM answers in Redis for 24 hours.

## LLM Notes

- **Provider:** OpenAI  
- **Model:** `gpt-4o-mini`

### Prompt Engineering

- **System Prompt:** Persona (“SpurBot”) with strict knowledge base.
- **Guardrails:** No invented policies.
- **Context Management:** Last 10 messages only.

## ⚖️ Trade-offs & Future Improvements

### Vector Search (RAG)
- Current: Hardcoded knowledge base.
- Better: pgvector or ChromaDB.

### WebSockets
- Current: HTTP.
- Better: WebSockets / SSE.

### Analytics Dashboard
- Cache hit rate and FAQ insights.

### Admin Panel
- View conversation logs stored in SQLite.
