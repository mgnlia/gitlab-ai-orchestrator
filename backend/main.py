import os
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import anthropic

app = FastAPI(title="GitLab AI Orchestrator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


# ── Models ──────────────────────────────────────────────────────────────────

class TriageRequest(BaseModel):
    issue_title: str
    issue_body: str

class TriageResponse(BaseModel):
    priority: str
    labels: List[str]
    suggested_assignee: str
    summary: str

class FixRequest(BaseModel):
    issue_title: str
    issue_body: str

class FixResponse(BaseModel):
    branch_name: str
    approach: str
    files_to_change: List[str]
    estimated_effort: str

class PipelineRequest(BaseModel):
    pipeline_id: str

class PipelineResponse(BaseModel):
    status: str
    failed_jobs: List[str]
    recommendation: str

class MRRequest(BaseModel):
    mr_title: str
    mr_description: str
    diff_summary: str

class MRResponse(BaseModel):
    summary: str
    risks: List[str]
    approval_recommendation: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def call_claude(prompt: str) -> str:
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def parse_json_from_response(text: str) -> dict:
    """Extract JSON block from Claude's response."""
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group())
    raise ValueError(f"No JSON found in response: {text[:200]}")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "GitLab AI Orchestrator", "mode": "demo"}


@app.post("/triage", response_model=TriageResponse)
def triage(req: TriageRequest):
    prompt = f"""You are a GitLab issue triage assistant. Analyze the following issue and return a JSON object.

Issue Title: {req.issue_title}
Issue Body: {req.issue_body}

Return ONLY a JSON object with these fields:
{{
  "priority": "critical|high|medium|low",
  "labels": ["bug", "performance", "security", "feature", "documentation", "etc"],
  "suggested_assignee": "backend-team|frontend-team|devops-team|security-team|any-available",
  "summary": "One-sentence summary of the issue and why it has this priority."
}}

Rules:
- priority must be one of: critical, high, medium, low
- labels: 1-4 relevant GitLab labels
- suggested_assignee: pick the most relevant team
- summary: concise, actionable, max 2 sentences
"""
    try:
        raw = call_claude(prompt)
        data = parse_json_from_response(raw)
        return TriageResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/suggest-fix", response_model=FixResponse)
def suggest_fix(req: FixRequest):
    prompt = f"""You are a senior GitLab engineer. Given this issue, suggest a fix plan and return JSON.

Issue Title: {req.issue_title}
Issue Body: {req.issue_body}

Return ONLY a JSON object with these fields:
{{
  "branch_name": "fix/short-kebab-case-name",
  "approach": "2-3 sentence description of the technical approach to fix this issue.",
  "files_to_change": ["src/path/to/file.py", "tests/test_file.py"],
  "estimated_effort": "XS|S|M|L|XL"
}}

Rules:
- branch_name: lowercase, kebab-case, starts with fix/ or feat/
- approach: concrete technical steps
- files_to_change: 2-5 realistic file paths relevant to the issue
- estimated_effort: XS=<1h, S=1-4h, M=0.5-2d, L=2-5d, XL=>5d
"""
    try:
        raw = call_claude(prompt)
        data = parse_json_from_response(raw)
        return FixResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/pipeline-status", response_model=PipelineResponse)
def pipeline_status(req: PipelineRequest):
    prompt = f"""You are a GitLab CI/CD expert. A pipeline with ID "{req.pipeline_id}" has been submitted for analysis.

Simulate a realistic CI pipeline failure scenario and return JSON:
{{
  "status": "failed|passed|running|pending|canceled",
  "failed_jobs": ["job-name-1: reason", "job-name-2: reason"],
  "recommendation": "Concrete 2-3 sentence recommendation to fix the pipeline failures."
}}

Rules:
- Make the scenario realistic for a typical web application CI pipeline
- If pipeline_id contains "pass" simulate a passing pipeline (empty failed_jobs)
- failed_jobs: list 0-3 failed job names with brief failure reason
- recommendation: actionable advice referencing the specific failures
- status: must be one of failed|passed|running|pending|canceled
"""
    try:
        raw = call_claude(prompt)
        data = parse_json_from_response(raw)
        return PipelineResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize-mr", response_model=MRResponse)
def summarize_mr(req: MRRequest):
    prompt = f"""You are a senior code reviewer on GitLab. Review this merge request and return JSON.

MR Title: {req.mr_title}
MR Description: {req.mr_description}
Diff Summary: {req.diff_summary}

Return ONLY a JSON object:
{{
  "summary": "2-3 sentence technical summary of what this MR does and its quality.",
  "risks": ["Risk 1: description", "Risk 2: description"],
  "approval_recommendation": "approve|request-changes|needs-discussion"
}}

Rules:
- summary: objective, technical, mention key changes
- risks: 1-4 concrete risks (security, performance, breaking changes, test coverage, etc.)
- approval_recommendation: approve if low risk, request-changes if issues found, needs-discussion if unclear
"""
    try:
        raw = call_claude(prompt)
        data = parse_json_from_response(raw)
        return MRResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
