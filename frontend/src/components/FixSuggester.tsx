"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const EFFORT_COLORS: Record<string, string> = {
  XS: "bg-green-500/10 text-green-400 border-green-500/30",
  S: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  M: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  L: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  XL: "bg-red-500/10 text-red-400 border-red-500/30",
};

interface FixResult {
  branch_name: string;
  approach: string;
  files_to_change: string[];
  estimated_effort: string;
}

const EXAMPLE = {
  title: "Pagination breaks when filtering results by date range",
  body: "The pagination component loses its state when users apply date filters. After filtering, clicking 'next page' returns to page 1 instead of advancing. This happens in the /reports and /analytics views. The issue started after the React Query v5 migration.",
};

export default function FixSuggester() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<FixResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/suggest-fix`, {
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

  const loadExample = () => {
    setTitle(EXAMPLE.title);
    setBody(EXAMPLE.body);
    setResult(null);
    setError("");
  };

  const copyBranch = () => {
    if (result?.branch_name) {
      navigator.clipboard.writeText(`git checkout -b ${result.branch_name}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Fix Suggester</h2>
        <p className="text-[#9B9A9F] text-sm">
          Describe an issue and get an AI-generated branch name, fix approach, and list of files to change.
        </p>
      </div>

      <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[#9B9A9F] text-sm font-medium">Issue Details</label>
          <button
            onClick={loadExample}
            className="text-xs text-[#FC6D26] hover:text-[#FC6D26]/80 transition-colors"
          >
            Load example →
          </button>
        </div>

        <input
          type="text"
          placeholder="Issue title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#141217] border border-[#383640] rounded-lg px-4 py-3 text-white placeholder-[#9B9A9F] text-sm focus:outline-none focus:border-[#FC6D26] transition-colors"
        />

        <textarea
          placeholder="Issue description..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full bg-[#141217] border border-[#383640] rounded-lg px-4 py-3 text-white placeholder-[#9B9A9F] text-sm focus:outline-none focus:border-[#FC6D26] transition-colors resize-none"
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
              Generating fix plan...
            </span>
          ) : (
            "🔧 Suggest Fix"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-400 text-sm font-medium">Fix Plan Generated</span>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-3 uppercase tracking-wider">Branch Name</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-[#FC6D26] font-mono text-sm bg-[#FC6D26]/5 border border-[#FC6D26]/20 px-3 py-2 rounded-lg">
                {result.branch_name}
              </code>
              <button
                onClick={copyBranch}
                className="px-3 py-2 rounded-lg bg-[#252429] border border-[#383640] text-[#9B9A9F] hover:text-white text-xs transition-colors whitespace-nowrap"
              >
                {copied ? "✓ Copied" : "Copy git cmd"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Estimated Effort</p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${
                  EFFORT_COLORS[result.estimated_effort] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
                }`}
              >
                {result.estimated_effort}
              </span>
            </div>

            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Files to Change</p>
              <p className="text-white text-lg font-bold">{result.files_to_change?.length || 0}</p>
            </div>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Fix Approach</p>
            <p className="text-white text-sm leading-relaxed">{result.approach}</p>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-3 uppercase tracking-wider">Files to Change</p>
            <div className="space-y-2">
              {result.files_to_change?.map((file, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#9B9A9F] text-xs">📄</span>
                  <code className="text-[#a78bfa] font-mono text-xs">{file}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
