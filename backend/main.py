import os
import json
import anthropic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="GitLab AI Orchestrator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


def ask_claude(prompt: str) -> str:
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


# ── Models ──────────────────────────────────────────────────────────────────

class TriageRequest(BaseModel):
    issue_title: str
    issue_body: str

class SuggestFixRequest(BaseModel):
    issue_title: str
    issue_body: str

class PipelineStatusRequest(BaseModel):
    pipeline_id: str

class SummarizeMRRequest(BaseModel):
    mr_title: str
    mr_description: str
    diff_summary: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "gitlab-ai-orchestrator"}


@app.post("/triage")
def triage(req: TriageRequest):
    prompt = f"""You are a GitLab issue triage expert. Analyze this issue and return ONLY valid JSON.

Issue Title: {req.issue_title}
Issue Body: {req.issue_body}

Return JSON with exactly these fields:
{{
  "priority": "critical|high|medium|low",
  "labels": ["list", "of", "relevant", "labels"],
  "suggested_assignee": "role or team name best suited",
  "summary": "2-3 sentence summary of the issue and its impact"
}}"""
    
    raw = ask_claude(prompt)
    # Extract JSON from response
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        return json.loads(raw[start:end])
    except Exception:
        return {
            "priority": "medium",
            "labels": ["needs-triage"],
            "suggested_assignee": "backend-team",
            "summary": raw[:300]
        }


@app.post("/suggest-fix")
def suggest_fix(req: SuggestFixRequest):
    prompt = f"""You are a senior GitLab engineer. Suggest a fix approach for this issue and return ONLY valid JSON.

Issue Title: {req.issue_title}
Issue Body: {req.issue_body}

Return JSON with exactly these fields:
{{
  "branch_name": "fix/short-descriptive-name",
  "approach": "Clear description of the fix approach in 2-3 sentences",
  "files_to_change": ["list/of/relevant/files.py", "another/file.ts"],
  "estimated_effort": "XS|S|M|L|XL"
}}"""
    
    raw = ask_claude(prompt)
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        return json.loads(raw[start:end])
    except Exception:
        return {
            "branch_name": "fix/issue-resolution",
            "approach": raw[:300],
            "files_to_change": ["src/main.py"],
            "estimated_effort": "M"
        }


@app.post("/pipeline-status")
def pipeline_status(req: PipelineStatusRequest):
    prompt = f"""You are a CI/CD expert analyzing a GitLab pipeline. Pipeline ID: {req.pipeline_id}

Simulate a realistic pipeline analysis and return ONLY valid JSON with exactly these fields:
{{
  "status": "failed|passed|running|pending",
  "failed_jobs": [
    {{"name": "job-name", "stage": "stage-name", "error": "brief error description"}}
  ],
  "recommendation": "Actionable recommendation to fix the pipeline in 2-3 sentences"
}}

Make it realistic for a typical web application CI pipeline."""
    
    raw = ask_claude(prompt)
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        return json.loads(raw[start:end])
    except Exception:
        return {
            "status": "failed",
            "failed_jobs": [{"name": "test", "stage": "test", "error": "Analysis unavailable"}],
            "recommendation": raw[:300]
        }


@app.post("/summarize-mr")
def summarize_mr(req: SummarizeMRRequest):
    prompt = f"""You are a senior code reviewer. Analyze this merge request and return ONLY valid JSON.

MR Title: {req.mr_title}
MR Description: {req.mr_description}
Diff Summary: {req.diff_summary}

Return JSON with exactly these fields:
{{
  "summary": "Concise 2-3 sentence summary of what this MR does",
  "risks": ["list", "of", "potential", "risks", "or", "concerns"],
  "approval_recommendation": "approve|request-changes|needs-discussion",
  "review_notes": "Additional reviewer notes in 1-2 sentences"
}}"""
    
    raw = ask_claude(prompt)
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        return json.loads(raw[start:end])
    except Exception:
        return {
            "summary": raw[:300],
            "risks": ["Manual review recommended"],
            "approval_recommendation": "needs-discussion",
            "review_notes": "AI parsing encountered an issue. Please review manually."
        }
