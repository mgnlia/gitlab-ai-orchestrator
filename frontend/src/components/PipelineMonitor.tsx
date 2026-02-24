"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gitlab-ai-orchestrator-backend.vercel.app";

const STATUS_STYLES: Record<string, { color: string; icon: string; bg: string }> = {
  failed: { color: "text-red-400", icon: "✗", bg: "bg-red-900/20 border-red-800" },
  passed: { color: "text-green-400", icon: "✓", bg: "bg-green-900/20 border-green-800" },
  running: { color: "text-blue-400", icon: "↻", bg: "bg-blue-900/20 border-blue-800" },
  pending: { color: "text-yellow-400", icon: "◔", bg: "bg-yellow-900/20 border-yellow-800" },
  canceled: { color: "text-gray-400", icon: "⊘", bg: "bg-gray-900/20 border-gray-700" },
};

interface PipelineResult {
  status: string;
  failed_jobs: string[];
  recommendation: string;
}

const EXAMPLES = [
  { id: "pipeline-12345", label: "🔴 Failed Pipeline" },
  { id: "pipeline-pass-99", label: "🟢 Passing Pipeline" },
  { id: "pipeline-67890", label: "⚠️ Flaky Tests" },
];

export default function PipelineMonitor() {
  const [pipelineId, setPipelineId] = useState("");
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!pipelineId.trim()) {
      setError("Please enter a pipeline ID.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/pipeline-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline_id: pipelineId }),
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

  const style = result ? (STATUS_STYLES[result.status] || STATUS_STYLES.pending) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Pipeline Monitor</h2>
        <p className="text-gitlab-muted text-sm">
          Enter a pipeline ID to get AI-powered failure analysis and remediation recommendations.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-gitlab-muted text-xs self-center">Try an example:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => { setPipelineId(ex.id); setResult(null); setError(""); }}
            className="px-3 py-1 text-xs rounded-full border border-gitlab-border text-gitlab-muted hover:text-white hover:border-gitlab-orange transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gitlab-muted mb-1.5">Pipeline ID</label>
          <input
            type="text"
            value={pipelineId}
            onChange={(e) => setPipelineId(e.target.value)}
            placeholder="e.g. pipeline-12345 or 67890"
            className="w-full bg-gitlab-card border border-gitlab-border rounded-lg px-4 py-3 text-white placeholder-gitlab-muted focus:outline-none focus:border-gitlab-orange transition-colors text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <p className="text-gitlab-muted text-xs mt-1">Tip: include &quot;pass&quot; in the ID to simulate a passing pipeline</p>
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
              Analyzing pipeline...
            </span>
          ) : (
            "⚙️ Analyze Pipeline"
          )}
        </button>
      </div>

      {result && style && (
        <div className="bg-gitlab-card border border-gitlab-border rounded-xl p-6 space-y-5">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${style.bg}`}>
            <span className={`text-2xl font-bold ${style.color}`}>{style.icon}</span>
            <div>
              <p className={`font-bold text-lg uppercase ${style.color}`}>{result.status}</p>
              <p className="text-gitlab-muted text-xs">Pipeline #{pipelineId}</p>
            </div>
          </div>

          {result.failed_jobs.length > 0 && (
            <div>
              <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-3">
                Failed Jobs ({result.failed_jobs.length})
              </p>
              <div className="space-y-2">
                {result.failed_jobs.map((job, i) => (
                  <div key={i} className="flex items-start gap-3 bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-3">
                    <span className="text-red-400 mt-0.5">✗</span>
                    <p className="text-red-300 text-sm">{job}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.failed_jobs.length === 0 && result.status === "passed" && (
            <div className="flex items-center gap-3 bg-green-900/10 border border-green-900/30 rounded-lg px-4 py-3">
              <span className="text-green-400">✓</span>
              <p className="text-green-300 text-sm">All jobs passed successfully!</p>
            </div>
          )}

          <div>
            <p className="text-gitlab-muted text-xs uppercase tracking-wide mb-2">AI Recommendation</p>
            <div className="bg-gitlab-dark border border-gitlab-border rounded-lg px-4 py-3">
              <p className="text-white text-sm leading-relaxed">{result.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
