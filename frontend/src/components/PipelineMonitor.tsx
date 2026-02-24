"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FailedJob {
  name: string;
  stage: string;
  error: string;
}

interface PipelineResult {
  status: string;
  failed_jobs: FailedJob[];
  recommendation: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400", label: "Failed" },
  passed: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400", label: "Passed" },
  running: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400", label: "Running" },
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400", label: "Pending" },
};

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
      const res = await fetch(`${API_URL}/pipeline-status`, {
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

  const statusKey = result?.status?.toLowerCase() || "failed";
  const statusStyle = STATUS_CONFIG[statusKey] || STATUS_CONFIG.failed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-semibold mb-1">Pipeline Monitor</h2>
        <p className="text-[#9B9A9F] text-sm">
          Enter a pipeline ID and get AI-powered failure analysis with actionable recommendations.
        </p>
      </div>

      <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-4">
        <label className="text-[#9B9A9F] text-sm font-medium">Pipeline ID</label>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. 1234567 or pipeline-abc"
            value={pipelineId}
            onChange={(e) => setPipelineId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-[#141217] border border-[#383640] rounded-lg px-4 py-3 text-white placeholder-[#9B9A9F] text-sm focus:outline-none focus:border-[#FC6D26] transition-colors"
          />
          <button
            onClick={() => { setPipelineId("9876543"); setResult(null); setError(""); }}
            className="px-4 py-3 rounded-lg bg-[#252429] border border-[#383640] text-[#9B9A9F] hover:text-white text-sm transition-colors whitespace-nowrap"
          >
            Demo ID
          </button>
        </div>

        <p className="text-[#9B9A9F] text-xs">
          💡 Demo mode — AI generates realistic pipeline analysis for any ID
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#FC6D26] hover:bg-[#FC6D26]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing pipeline...
            </span>
          ) : (
            "⚡ Check Pipeline"
          )}
        </button>
      </div>

      {result && (
        <div className="bg-[#1F1E24] border border-[#383640] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-sm font-medium">Analysis Complete</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusStyle.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
              <span className={`${statusStyle.text} text-sm font-semibold`}>
                Pipeline {statusStyle.label}
              </span>
            </div>
          </div>

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-1 uppercase tracking-wider">Pipeline ID</p>
            <code className="text-[#FC6D26] font-mono text-sm">#{pipelineId}</code>
          </div>

          {result.failed_jobs?.length > 0 && (
            <div className="bg-[#141217] rounded-lg p-4">
              <p className="text-[#9B9A9F] text-xs mb-3 uppercase tracking-wider">
                Failed Jobs ({result.failed_jobs.length})
              </p>
              <div className="space-y-3">
                {result.failed_jobs.map((job, i) => (
                  <div key={i} className="border border-red-500/20 rounded-lg p-3 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-400 text-xs">✗</span>
                      <span className="text-white text-sm font-medium">{job.name}</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-[#252429] text-[#9B9A9F] border border-[#383640]">
                        {job.stage}
                      </span>
                    </div>
                    <p className="text-[#9B9A9F] text-xs pl-4">{job.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.failed_jobs?.length === 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-green-400 text-sm">✓ No failed jobs detected</p>
            </div>
          )}

          <div className="bg-[#141217] rounded-lg p-4">
            <p className="text-[#9B9A9F] text-xs mb-2 uppercase tracking-wider">AI Recommendation</p>
            <p className="text-white text-sm leading-relaxed">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
