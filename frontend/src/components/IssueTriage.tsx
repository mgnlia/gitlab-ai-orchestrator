"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gitlab-ai-orchestrator-backend.vercel.app";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-900/40 text-red-400 border-red-800",
  high: "bg-orange-900/40 text-orange-400 border-orange-800",
  medium: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  low: "bg-blue-900/40 text-blue-400 border-blue-800",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵",
};

interface TriageResult {
  priority: string;
  labels: string[];
  suggested_assignee: string;
  summary: string;
}

const EXAMPLES = [
  {
    title: "Application crashes on login with special characters in password",
    body: "When users enter passwords containing special characters like @, #, or !, the application throws a 500 error and crashes. This affects all users trying to reset their passwords. Error log shows: UnhandledPromiseRejectionWarning: SyntaxError: Unexpected token in JSON.",
  },
  {
    title: "Add dark mode support to the dashboard",
    body: "Users have been requesting dark mode for a while. We should implement a theme toggle that persists user preference. This would improve UX for users working in low-light environments.",
  },
];

export default function IssueTriage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both the issue title and body.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue_title: title, issue_body: body }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: { title: string; body: string }) => {
    setTitle(ex.title);
    setBody(ex.body);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Issue Triage</h2>
        <p className="text-gitlab-muted text-sm">
          Paste a GitLab issue and let AI classify priority, assign labels, and suggest the right team.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-gitlab-muted text-xs self-center">Try an example:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(ex)}
            className="px-3 py-1 text-xs rounded-full border border-gitlab-border text-gitlab-muted hover:text-white hover:border-gitlab-orange transition-colors"
          >
            {i === 0 ? "🐛 Bug Report" : "✨ Feature Request"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gitlab-muted mb-1.5">Issue Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Application crashes on login with special characters"
            className="w-full bg-gitlab-card border border-gitlab-border rounded-lg px-4 py-3 text-white placeholder-gitlab-muted focus:outline-none focus:border-gitlab-orange transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gitlab-muted mb-1.5">Issue Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the issue in detail — steps to reproduce, expected vs actual behavior, error logs..."
            rows={5}
            className="w-full bg-gitlab-card border border-gitlab-border rounded-lg px-4 py-3 text-white placeholder-gitlab-muted focus:outline-none focus:border-gitlab-orange transition-colors text-sm resize-none"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-gitlab-orange hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "🏷️ Triage Issue"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-gitlab-card border border-gitlab-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Triage Result</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${PRIORITY_COLORS[result.priority] || PRIORITY_COLORS.medium}`}
            >
              {PRIORITY_ICONS[result.priority]} {result.priority.toUpperCase()} PRIORITY
            </span>
          </div>

          <div>
            <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">AI Summary</p>
            <p className="text-white text-sm leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">Labels</p>
              <div className="flex flex-wrap gap-2">
                {result.labels.map((label) => (
                  <span key={label} className="px-2 py-1 bg-gitlab-purple/20 text-purple-300 border border-purple-800/50 rounded text-xs">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">Suggested Assignee</p>
              <span className="px-3 py-1 bg-gitlab-dark border border-gitlab-border rounded-lg text-white text-sm">
                👤 {result.suggested_assignee}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
