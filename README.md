# SprintZero

An autonomous project-scaffolding agent built with Google's Agent Development Kit (ADK). Upload a project brief and team list, and SprintZero generates a complete sprint plan with tasks, sync meetings, Google Sheets, Calendar events with Google Meet links, and email notifications.

## Architecture

### ADK Agent Pipeline

The core of SprintZero is an ADK agent pipeline built with `SequentialAgent` and `ParallelAgent` primitives:

```
SequentialAgent (sprintzero_pipeline)
├── LlmAgent (planner) - gemini-3.5-flash
│   └── Reads PDF + team list → produces WBS + sync meetings with AI-written agendas
├── ParallelAgent (sheets_and_calendar)
│   ├── SheetsAgent (deterministic) - Creates Google Sheet with tasks + meets
│   └── CalendarAgent (deterministic) - Creates Calendar events (with Google Meet) for tasks + meetings
└── EmailAgent (deterministic) - Sends summary emails with Sheet URL and Meet links
```

**Key design decision**: Only the Planner uses an LLM. Sheets, Calendar, and Email are deterministic custom ADK agents that call Google APIs directly. This avoids 3 unnecessary LLM round-trips and demonstrates intentional use of ADK's custom agent pattern.

### Authentication & Persistence

- **Google OAuth 2.0** with offline access → refresh tokens stored encrypted in Firestore
- **Session cookies** (httpOnly) for return visits — no re-consent prompt
- **Firestore** stores user records and run history (separate from ADK session state)
- **Revoked token handling** → catches `invalid_grant` and prompts the user to sign in again

### Live Agent Log

The Express `POST /api/process` endpoint streams ADK runner events via SSE. The frontend consumes this with `fetch` + `ReadableStream` (not `EventSource`, since it's a POST with file upload). At the end of the stream the pipeline waits for the user to continue rather than auto-navigating.

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, react-dropzone
- **Backend**: Node.js 20 + Express
- **Agent Framework**: `@google/adk` + `@google/adk-devtools`
- **Google APIs**: `googleapis` (Sheets v4, Calendar v3, Gmail v1)
- **Database**: Firestore via `firebase-admin`
- **Validation**: `zod` for planner output schema (via ADK's `zodObjectToSchema`)
- **Deployment**: Single Cloud Run service (Docker)

## Local Development

### Prerequisites

- Node.js 20+
- Google Cloud project with:
  - Firestore API (Native mode)
  - Google Sheets API
  - Google Drive API
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

For local development, use `http://localhost:8080/api/auth/callback` in your Google Cloud Console OAuth client configuration. Because the frontend talks to the API through the Vite proxy (same origin) in development, and the monolith serves the SPA from the API in production, CORS is handled by the server's own-origin detection.

### OAuth Scopes

The app requests the following scopes:
`spreadsheets`, `drive` (to allow public sharing of generated sheets), `calendar`, `gmail.send`, and `userinfo.email`. After changing scopes, users must re-authenticate once so a new refresh token with the updated scopes is stored.

## Project Structure

```
sprintzero/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Shell, Sidebar, TopBar, Card, Button, icons, etc.
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── UploadForm.jsx
│   │   │   ├── AgentLog.jsx
│   │   │   ├── SuccessScreen.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ProjectDetail.jsx
│   │   ├── lib/api.js
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
│   │       ├── agentEvents.js
│   │       └── pipeline.js
│   ├── package.json
│   └── .env.example
├── Dockerfile
├── .dockerignore
├── .github/workflows/deploy.yml
├── package.json
└── README.md
```

## Deployment

### Docker image

A multi-stage `Dockerfile` at the **repo root** (with `.dockerignore` to keep `node_modules`, `.env`, and `keys/` out of the image):

- **Stage 1** (`client-build`): installs client deps and runs `vite build`.
- **Stage 2**: installs only server production deps, copies the server source, and copies the built `client/dist` into `server/public` (producing the monolith), then runs the Node server on port 8080.

Because the Dockerfile is at the root, the build context is the repo root:

```bash
docker build -t gcr.io/PROJECT_ID/sprintzero .
```

### Cloud Run (CI)

A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main` and:

1. Authenticates to GCP via **Workload Identity Federation** (no stored service-account key)
2. Builds & pushes the Docker image to Artifact Registry
3. Deploys to Cloud Run with `NODE_ENV`, Firestore database id, OAuth redirect URI, and secrets from Secret Manager

### Manual Cloud Run deploy

```bash
gcloud services enable firestore.googleapis.com run.googleapis.com artifactregistry.googleapis.com

gcloud run deploy sprintzero \
  --image=gcr.io/PROJECT_ID/sprintzero \
  --region=asia-south1 \
  --allow-unauthenticated \
  --port=8080
```

- Set `GOOGLE_REDIRECT_URI` and the OAuth client's authorized redirect to the deployed URL (e.g. `https://sprintzero-xxxx.region.run.app/api/auth/callback`).
- Configure the Cloud Run service account with the `Cloud Datastore User` (Firestore) IAM role.

## Demo Highlights

1. **ADK DevTools trace** — run `npx adk web` to show the pipeline's event trace
2. **Live agent log** — SSE streaming shows parallel Sheets/Calendar execution
3. **Google Meet links** — every generated meeting event includes a clickable Meet link, surfaced in the UI and email
4. **Resilience** — bad email addresses don't crash the run; transient Google API errors are retried with backoff
5. **Returning user** — no Google consent prompt on subsequent visits (after the initial scope-approved sign-in)

## License

MIT

