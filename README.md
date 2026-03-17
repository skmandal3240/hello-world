# LangExchange — Language Learning via Real Conversations

Practice a new language through live voice exchanges with native speakers, backed by real-time AI feedback on your grammar and vocabulary.

## Features

- **Language exchange matching** — paired with a native speaker of your target language who wants to learn yours
- **Voice sessions** — browser-native speech recognition (Web Speech API), no audio ever leaves your device
- **AI feedback** — powered by Claude (`claude-sonnet-4-6`); instant grammar corrections, vocabulary suggestions, and pronunciation score after each utterance
- **Session history** — review all past sessions with full transcript and corrections log
- **Streak tracking** — daily session streak and personal stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Node.js + Express + TypeScript + Socket.io |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Voice | Web Speech API (browser-native, Chrome/Edge) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Anthropic API key

### Setup

1. **Clone and install**
   ```bash
   git clone <repo>
   cd hello-world
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example server/.env
   # Edit server/.env with your values
   ```

   Required variables:
   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `JWT_ACCESS_SECRET` | Random secret, min 32 chars |
   | `JWT_REFRESH_SECRET` | Random secret, min 32 chars |
   | `ANTHROPIC_API_KEY` | Your `sk-ant-...` key |
   | `CLIENT_URL` | `http://localhost:5173` |

3. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev --name init
   npm run db:seed       # Seeds 20 languages
   cd ..
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   - Client: http://localhost:5173
   - Server: http://localhost:3000

### Voice Support

Voice features require **Chrome** or **Edge** (Web Speech API). Firefox is not supported.

## Project Structure

```
/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/          # Axios + API modules
│       ├── context/      # Auth + Socket contexts
│       ├── hooks/        # useSpeechRecognition, useSession, useMatchmaking
│       ├── pages/        # All route pages
│       └── components/   # UI components
└── server/          # Node.js + Express backend
    ├── prisma/       # Schema + migrations + seed
    └── src/
        ├── routes/       # REST API routes
        ├── services/     # Business logic + AI service
        ├── socket/       # Socket.io server + handlers
        └── middleware/   # Auth, validation, rate limiting
```

## AI Feedback

Each spoken utterance is analyzed by Claude with:
- User's proficiency level and target language
- Last 3 utterances as conversation context
- Response: corrected text, grammar errors (with severity), vocabulary suggestions, pronunciation score

Rate limit: 30 utterances/user/hour.
