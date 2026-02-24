"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gitlab-ai-orchestrator-backend.vercel.app";

const EFFORT_COLORS: Record<string, string> = {
  XS: "bg-green-900/40 text-green-400 border-green-800",
  S: "bg-teal-900/40 text-teal-400 border-teal-800",
  M: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  L: "bg-orange-900/40 text-orange-400 border-orange-800",
  XL: "bg-red-900/40 text-red-400 border-red-800",
};

const EFFORT_LABELS: Record<string, string> = {
  XS: "< 1 hour",
  S: "1–4 hours",
  M: "0.5–2 days",
  L: "2–5 days",
  XL: "> 5 days",
};

interface FixResult {
  branch_name: string;
  approach: string;
  files_to_change: string[];
  estimated_effort: string;
}

const EXAMPLES = [
  {
    title: "Memory leak in WebSocket connection handler",
    body: "The WebSocket connection handler is not properly cleaning up event listeners when connections close. This causes memory usage to grow unboundedly over time. After ~24h of uptime, the server runs out of memory. Stack trace: EventEmitter memory leak detected. 11 close listeners added to [WebSocket].",
  },
  {
    title: "Add rate limiting to the public API endpoints",
    body: "Our public API endpoints have no rate limiting. We are seeing abuse from bots making thousands of requests per minute. We need to implement rate limiting (100 req/min per IP) using Redis for distributed rate limiting across our cluster.",
  },
];

export default function FixSuggester() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<FixResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both the issue title and body.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/suggest-fix`, {
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

  const copyBranch = () => {
    if (result) {
      navigator.clipboard.writeText(`git checkout -b ${result.branch_name}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Fix Suggester</h2>
        <p className="text-gitlab-muted text-sm">
          Get an AI-generated fix plan: branch name, technical approach, and files to change.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-gitlab-muted text-xs self-center">Try an example:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setTitle(ex.title); setBody(ex.body); setResult(null); setError(""); }}
            className="px-3 py-1 text-xs rounded-full border border-gitlab-border text-gitlab-muted hover:text-white hover:border-gitlab-orange transition-colors"
          >
            {i === 0 ? "🧠 Memory Leak" : "🛡️ Rate Limiting"}
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
            placeholder="e.g. Memory leak in WebSocket connection handler"
            className="w-full bg-gitlab-card border border-gitlab-border rounded-lg px-4 py-3 text-white placeholder-gitlab-muted focus:outline-none focus:border-gitlab-orange transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gitlab-muted mb-1.5">Issue Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the issue — the more detail, the better the fix suggestion..."
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
              Generating fix plan...
            </span>
          ) : (
            "🔧 Suggest Fix"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-gitlab-card border border-gitlab-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Fix Plan</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${EFFORT_COLORS[result.estimated_effort] || EFFORT_COLORS.M}`}>
              {result.estimated_effort} · {EFFORT_LABELS[result.estimated_effort] || "Unknown"}
            </span>
          </div>

          <div>
            <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">Branch Name</p>
            <div className="flex items-center gap-2 bg-gitlab-dark rounded-lg px-4 py-3 border border-gitlab-border">
              <code className="text-gitlab-orange text-sm flex-1 font-mono">git checkout -b {result.branch_name}</code>
              <button
                onClick={copyBranch}
                className="text-gitlab-muted hover:text-white transition-colors text-xs px-2 py-1 rounded border border-gitlab-border hover:border-gitlab-orange"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">Technical Approach</p>
            <p className="text-white text-sm leading-relaxed">{result.approach}</p>
          </div>

          <div>
            <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">Files to Change</p>
            <div className="space-y-1.5">
              {result.files_to_change.map((file) => (
                <div key={file} className="flex items-center gap-2 text-sm">
                  <span className="text-gitlab-orange">📄</span>
                  <code className="text-green-300 font-mono text-xs">{file}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
