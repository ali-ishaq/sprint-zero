# SprintZero

An autonomous project-scaffolding agent built with Google's Agent Development Kit (ADK) for TypeScript. Upload a project brief and team list, and SprintZero generates a complete sprint plan with tasks, sync meetings, Google Sheets, Calendar events, and email notifications.

## Architecture

### ADK Agent Pipeline

The core of SprintZero is an ADK agent pipeline built with `SequentialAgent` and `ParallelAgent` primitives:

```
SequentialAgent (sprintzero_pipeline)
├── LlmAgent (planner) - Gemini 2.5 Flash
│   └── Reads PDF + team list → produces WBS + 2-3 sync meetings with AI-written agendas
├── ParallelAgent (sheets_and_calendar)
│   ├── SheetsAgent (deterministic) - Creates Google Sheet with tasks
│   └── CalendarAgent (deterministic) - Creates Calendar events for tasks + meetings
└── EmailAgent (deterministic) - Sends summary emails with Sheet URL
```

**Key design decision**: Only the Planner uses an LLM. Sheets, Calendar, and Email are deterministic custom ADK agents that call Google APIs directly. This avoids 3 unnecessary LLM round-trips and demonstrates intentional use of ADK's custom agent pattern.

### Authentication & Persistence

- **Google OAuth 2.0** with offline access → refresh tokens stored encrypted in Firestore
- **Session cookies** (httpOnly) for return visits — no re-consent prompt
- **Firestore** stores user records and run history (separate from ADK session state)
- **Revoked token handling** → catches `invalid_grant`, clears token, triggers fresh consent

### Live Agent Log

The Express `/api/process/process` endpoint streams ADK runner events via SSE. The frontend consumes this with `fetch` + `ReadableStream` (not `EventSource`, since it's a POST with file upload).

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, react-dropzone
- **Backend**: Node.js 20 + Express
- **Agent Framework**: `@google/adk` + `@google/adk-devtools`
- **Google APIs**: `googleapis` (Sheets v4, Calendar v3, Gmail v1)
- **Database**: Firestore via `firebase-admin`
- **Validation**: `zod` for planner output schema
- **Deployment**: Single Cloud Run service

## Local Development

### Prerequisites

- Node.js 20+
- Google Cloud project with:
  - Firestore API (Native mode)
  - Google Sheets API
  - Google Calendar API
  - Gmail API
  - OAuth 2.0 client ID (Web application)
- `TOKEN_ENC_KEY`: 32-byte hex key (generate with `openssl rand -hex 32`)

### Setup

```bash
# Clone and install
git clone <repo>
cd sprintzero
npm run install:all

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Start development servers
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` to backend)
- Backend: http://localhost:8080
- ADK DevTools: `npx adk web` (run in `server/` directory)

### OAuth Redirect URI

For local development, use `http://localhost:8080/api/auth/callback` in your Google Cloud Console OAuth client configuration.

## Project Structure

```
sprintzero/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── UploadForm.jsx
│   │   │   ├── AgentLog.jsx
│   │   │   ├── SuccessScreen.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/
│   ├── index.js
│   ├── middleware/
│   │   └── requireAuth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── process.js
│   │   └── runs.js
│   ├── lib/
│   │   ├── firestore.js
│   │   ├── crypto.js
│   │   ├── googleAuth.js
│   │   ├── tools/
│   │   │   ├── sheets.js
│   │   │   ├── calendar.js
│   │   │   └── gmail.js
│   │   └── agents/
│   │       ├── plannerAgent.js
│   │       ├── sheetsAgent.js
│   │       ├── calendarAgent.js
│   │       ├── emailAgent.js
│   │       └── pipeline.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── package.json
└── README.md
```

## Deployment

```bash
# Enable APIs
gcloud services enable firestore.googleapis.com run.googleapis.com

# Deploy
gcloud run deploy sprintzero --source . --region us-central1 --allow-unauthenticated

# Set environment variables in Cloud Run console
# Update GOOGLE_REDIRECT_URI and OAuth client authorized redirect to the deployed URL
```

Grant Cloud Run's default service account the `Cloud Datastore User` IAM role for Firestore access.

## Demo Highlights

1. **ADK DevTools trace** — run `npx adk web` to show the pipeline's event trace
2. **Live agent log** — SSE streaming shows parallel Sheets/Calendar execution
3. **Calendar agenda** — open a generated meeting event to see the AI-written 3-bullet agenda
4. **Resilience** — bad email addresses don't crash the run; failures surface as warnings
5. **Returning user** — no Google consent prompt on subsequent visits

## License

MIT