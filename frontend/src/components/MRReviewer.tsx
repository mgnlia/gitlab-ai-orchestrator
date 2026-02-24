"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const APPROVAL_STYLES: Record<string, { bg: string; text: string; border: string; icon: string; label: string }> = {
  "approve": {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    icon: "✓",
    label: "Approve",
  },
  "request-changes": {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: "✗",
    label: "Request Changes",
  },
  "needs-discussion": {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    icon: "?",
    label: "Needs Discussion",
  },
};

interface MRResult {
  summary: string;
  risks: string[];
  approval_recommendation: string;
  review_notes: string;
}

const EXAMPLE = {
  title: "feat: Add Redis caching layer for user sessions",
  description: "Implements Redis-based session caching to reduce database load. Sessions are now stored in Redis with a 24h TTL. Fallback to DB if Redis is unavailable. Includes connection pooling and error handling.",
  diff: "Modified: src/auth/session.py (+120, -45), src/config/redis.py (+60, -0), tests/test_session.py (+95, -12). Added Redis connection pool, session serialization/deserialization, TTL management, and graceful fallback logic.",
};

export default function MRReviewer() {
  const [mrTitle, setMrTitle] = useState("");
  const [mrDesc, setMrDesc] = useState("");
  const [diffSummary, setDiffSummary] = useState("");
  const [result, setResult] = useState<MRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!mrTitle.trim() || !mrDesc.trim() || !diffSummary.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/summarize-mr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mr_title: mrTitle,
          mr_description: mrDesc,
          diff_summary: diffSummary,
        }),
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

  const loadExample = () => {
    setMrTitle(EXAMPLE.title);
    setMrDesc(EXAMPLE.description);
    setDiffSummary(EXAMPLE.diff);
    setResult(null);
    setError("");
  };

  const approvalStyle =
    APPROVAL_STYLES[result?.approval_recommendation || "needs-discussion"] ||
    APPROVAL_STYLES["needs-discussion"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">MR Reviewer</h2>
        <p className="text-[#9B9A9F] text-sm">
          Paste a merge request title, description, and diff summary to get an AI-powered code review.
        </p>
      </div>

      <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[#9B9A9F] text-sm font-medium">Merge Request Details</label>
          <button
            onClick={loadExample}
            className="text-xs text-[#FC6D26] hover:text-[#FC6D26]/80 transition-colors"
          >
            Load example →
          </button>
        </div>

        <input
          type="text"
          placeholder="MR title..."
          value={mrTitle}
          onChange={(e) => setMrTitle(e.target.value)}
          className="w-full bg-[#141217] border border-[#383640] rounded-lg px-4 py-3 text-white placeholder-[#9B9A9F] text-sm focus:outline-none focus:border-[#FC6D26] transition-colors"
        />

        <textarea
          placeholder="MR description — what does this change do?"
          value={mrDesc}
          onChange={(e) => setMrDesc(e.target.value)}
          rows={3}
          className="w-full bg-[#141217] border border-[#383640] rounded-lg px-4 py-3 text-white placeholder-[#9B9A9F] text-sm focus:outline-none focus:border-[#FC6D26] transition-colors resize-none"
        />

        <textarea
          placeholder="Diff summary — files changed, lines added/removed, key modifications..."
          value={diffSummary}
          onChange={(e) => setDiffSummary(e.target.value)}
          rows={4}
          className="w-full bg-[#141217] border border-[#383640] rounded-lg px-4 py-3 text-white placeholder-[#9B9A9F] text-sm focus:outline-none focus:border-[#FC6D26] transition-colors resize-none font-mono"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#FC6D26] hover:bg-[#FC6D26]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Reviewing MR...
            </span>
          ) : (
            "📋 Review MR"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-sm font-medium">Review Complete</span>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${approvalStyle.bg} border ${approvalStyle.border}`}
            >
              <span className={`${approvalStyle.text} text-sm font-bold`}>{approvalStyle.icon}</span>
              <span className={`${approvalStyle.text} text-sm font-semibold`}>
                {approvalStyle.label}
              </span>
            </div>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Summary</p>
            <p className="text-white text-sm leading-relaxed">{result.summary}</p>
          </div>

          {result.risks?.length > 0 && (
            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-3 uppercase tracking-wider">
                Risks & Concerns ({result.risks.length})
              </p>
              <div className="space-y-2">
                {result.risks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-yellow-400 text-xs mt-0.5">⚠</span>
                    <p className="text-white text-sm">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.review_notes && (
            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Reviewer Notes</p>
              <p className="text-white text-sm leading-relaxed">{result.review_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
