import os
import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import anthropic

app = FastAPI(
    title="GitLab AI Orchestrator",
    description="Multi-Agent AI system for GitLab issue triage, fix suggestions, pipeline monitoring, and MR reviews",
    version="1.0.0",
)

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

def ask_claude(prompt: str, system: str = "") -> str:
    """Call Claude and return the text response."""
    messages = [{"role": "user", "content": prompt}]
    kwargs = {"model": "claude-3-5-haiku-20241022", "max_tokens": 1024, "messages": messages}
    if system:
        kwargs["system"] = system
    response = client.messages.create(**kwargs)
    return response.content[0].text


def parse_json_response(text: str) -> dict:
    """Extract the first JSON object from a Claude response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"No JSON found in response: {text[:200]}")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "gitlab-ai-orchestrator", "mode": "demo"}


@app.post("/triage", response_model=TriageResponse)
def triage(req: TriageRequest):
    system = (
        "You are a senior GitLab engineering lead. Analyze issues and respond ONLY with valid JSON."
    )
    prompt = f"""Triage this GitLab issue and return a JSON object with exactly these keys:
- priority: one of "critical", "high", "medium", "low"
- labels: array of 2-4 relevant label strings (e.g. "bug", "performance", "security", "UX", "backend", "frontend", "docs", "testing")
- suggested_assignee: a realistic team role string (e.g. "Backend Engineer", "Security Team", "Frontend Lead")
- summary: 1-2 sentence plain-English triage summary

Issue title: {req.issue_title}
Issue body: {req.issue_body}

Respond with ONLY the JSON object, no other text."""

    try:
        raw = ask_claude(prompt, system)
        data = parse_json_response(raw)
        return TriageResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI triage failed: {str(e)}")


@app.post("/suggest-fix", response_model=FixResponse)
def suggest_fix(req: FixRequest):
    system = (
        "You are a senior software engineer. Suggest concrete fixes for GitLab issues. Respond ONLY with valid JSON."
    )
    prompt = f"""Suggest a fix for this GitLab issue and return a JSON object with exactly these keys:
- branch_name: a git branch name following the pattern fix/short-description or feat/short-description
- approach: 2-3 sentence description of the technical approach to fix this issue
- files_to_change: array of 2-5 realistic file paths that would need to be modified
- estimated_effort: one of "< 1 hour", "1-4 hours", "1-2 days", "3-5 days", "1+ week"

Issue title: {req.issue_title}
Issue body: {req.issue_body}

Respond with ONLY the JSON object, no other text."""

    try:
        raw = ask_claude(prompt, system)
        data = parse_json_response(raw)
        return FixResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI fix suggestion failed: {str(e)}")


@app.post("/pipeline-status", response_model=PipelineResponse)
def pipeline_status(req: PipelineRequest):
    system = (
        "You are a DevOps expert analyzing CI/CD pipeline failures. Respond ONLY with valid JSON."
    )
    prompt = f"""Simulate analysis of GitLab CI pipeline #{req.pipeline_id} and return a JSON object with exactly these keys:
- status: one of "passed", "failed", "running", "pending", "canceled"
- failed_jobs: array of 0-3 job name strings that failed (empty array if passed). Use realistic CI job names like "unit-tests", "lint", "build", "security-scan", "deploy-staging"
- recommendation: 2-3 sentence actionable recommendation for the team based on the pipeline status

Make the response realistic and varied based on the pipeline ID number. If pipeline ID ends in even digit, use "passed". If odd, use "failed" with 1-2 failed jobs.

Pipeline ID: {req.pipeline_id}

Respond with ONLY the JSON object, no other text."""

    try:
        raw = ask_claude(prompt, system)
        data = parse_json_response(raw)
        return PipelineResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI pipeline analysis failed: {str(e)}")


@app.post("/summarize-mr", response_model=MRResponse)
def summarize_mr(req: MRRequest):
    system = (
        "You are a senior code reviewer. Provide thorough MR reviews. Respond ONLY with valid JSON."
    )
    prompt = f"""Review this GitLab Merge Request and return a JSON object with exactly these keys:
- summary: 2-3 sentence summary of what the MR does and its overall quality
- risks: array of 2-4 specific risk strings (e.g. "Missing test coverage for edge case X", "Potential N+1 query in loop", "No input validation on field Y")
- approval_recommendation: one of "Approve", "Approve with minor comments", "Request changes", "Needs major rework"

MR Title: {req.mr_title}
MR Description: {req.mr_description}
Diff Summary: {req.diff_summary}

Respond with ONLY the JSON object, no other text."""

    try:
        raw = ask_claude(prompt, system)
        data = parse_json_response(raw)
        return MRResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI MR summary failed: {str(e)}")
