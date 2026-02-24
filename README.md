# 🦊 GitLab AI Orchestrator

> AI-powered DevOps assistant for GitLab — Issue Triage, Fix Suggestions, Pipeline Monitoring, and MR Reviews.

Built for the **GitLab AI Hackathon 2026** ($65,000 prize).

## ✨ Features

| Tab | What it does |
|-----|-------------|
| 🔍 **Issue Triage** | Paste any GitLab issue → get priority, labels, assignee suggestion, and AI summary |
| 🔧 **Fix Suggester** | Describe a bug → get branch name, fix approach, files to change, effort estimate |
| ⚡ **Pipeline Monitor** | Enter a pipeline ID → get status, failed jobs breakdown, and fix recommendations |
| 📋 **MR Reviewer** | Paste an MR diff → get code review summary, risks, and approval recommendation |

> **Note on Pipeline Monitor:** The demo backend generates realistic pipeline data based on pipeline ID parity (even = passing, odd = failing). This simulates real GitLab pipeline states without requiring a live GitLab token. The `/health` endpoint returns `mode: demo` to reflect this.

## 🛠 Tech Stack

- **Backend:** Python 3.12, FastAPI, Anthropic Claude API, Vercel serverless
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Vercel
- **AI:** Claude claude-3-5-haiku-20241022 for all intelligent analysis

## 🏗 Architecture

```
gitlab-ai-orchestrator/
├── backend/
│   ├── main.py          # FastAPI app with all endpoints
│   ├── api/index.py     # Vercel serverless entry point
│   ├── vercel.json      # Vercel routing config
│   └── requirements.txt
└── frontend/
    ├── src/app/         # Next.js 14 App Router
    ├── src/components/  # IssueTriage, FixSuggester, PipelineMonitor, MRReviewer
    └── tailwind.config.ts
```

## 🔌 API Endpoints

```
GET  /health                    → service status (mode: demo)
POST /triage                    → issue priority + labels + assignee
POST /suggest-fix               → branch name + approach + files
POST /pipeline-status           → status + failed jobs + recommendation
POST /summarize-mr              → summary + risks + approval recommendation
```

## 🚀 Local Development

### Backend
```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## 📝 Environment Variables

**Backend (Vercel):**
```
ANTHROPIC_API_KEY=your_key_here
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## 🔗 Live Demo

- **Frontend:** https://gitlab-ai-orchestrator-frontend.vercel.app
- **Backend API:** https://gitlab-ai-orchestrator-m1lkk3bvb-mgnlias-projects.vercel.app/health
