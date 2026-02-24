"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-red-400",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-green-400",
};

interface TriageResult {
  priority: string;
  labels: string[];
  suggested_assignee: string;
  summary: string;
}

const EXAMPLE = {
  title: "Login fails with 500 error when email contains special characters",
  body: "When users try to log in with emails containing '+' or '.' characters, the authentication service returns a 500 Internal Server Error. This affects approximately 15% of our user base. Stack trace shows a SQL injection vulnerability in the email sanitization layer.",
};

export default function IssueTriage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/triage`, {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Issue Triage</h2>
        <p className="text-[#9B9A9F] text-sm">
          Paste a GitLab issue and get AI-powered priority classification, labels, and assignment suggestions.
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
          placeholder="Issue description, steps to reproduce, error logs..."
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
              Analyzing issue...
            </span>
          ) : (
            "🔍 Triage Issue"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-400 text-sm font-medium">Triage Complete</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Priority</p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                  PRIORITY_COLORS[result.priority?.toLowerCase()] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[result.priority?.toLowerCase()] || "bg-gray-400"}`} />
                {result.priority?.toUpperCase()}
              </span>
            </div>

            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">Suggested Assignee</p>
              <p className="text-white text-sm font-medium">{result.suggested_assignee}</p>
            </div>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-3 uppercase tracking-wider">Labels</p>
            <div className="flex flex-wrap gap-2">
              {result.labels?.map((label, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-[#6B4FBB]/20 text-[#a78bfa] border border-[#6B4FBB]/30 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">AI Summary</p>
            <p className="text-white text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
