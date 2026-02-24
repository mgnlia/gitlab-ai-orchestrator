"use client";

import { useState } from "react";
import IssueTriage from "@/components/IssueTriage";
import FixSuggester from "@/components/FixSuggester";
import PipelineMonitor from "@/components/PipelineMonitor";
import MRReviewer from "@/components/MRReviewer";

const TABS = [
  { id: "triage", label: "Issue Triage", icon: "🏷️" },
  { id: "fix", label: "Fix Suggester", icon: "🔧" },
  { id: "pipeline", label: "Pipeline Monitor", icon: "⚙️" },
  { id: "mr", label: "MR Reviewer", icon: "🔍" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("triage");

  return (
    <div className="min-h-screen bg-gitlab-darker">
      {/* Header */}
      <header className="border-b border-gitlab-border bg-gitlab-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gitlab-orange flex items-center justify-center text-white font-bold text-sm">
              GL
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">GitLab AI Orchestrator</h1>
              <p className="text-gitlab-muted text-xs">Autonomous issue triage · fix generation · CI monitoring · MR review</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-green-900/40 text-green-400 text-xs font-medium border border-green-800">
              ● Live Demo
            </span>
            <span className="px-2 py-1 rounded-full bg-gitlab-orange/20 text-gitlab-orange text-xs font-medium border border-gitlab-orange/30">
              Powered by Claude
            </span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="border-b border-gitlab-border bg-gitlab-dark/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-gitlab-orange text-gitlab-orange"
                    : "border-transparent text-gitlab-muted hover:text-white hover:border-gitlab-border"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "triage" && <IssueTriage />}
        {activeTab === "fix" && <FixSuggester />}
        {activeTab === "pipeline" && <PipelineMonitor />}
        {activeTab === "mr" && <MRReviewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gitlab-border mt-16 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-gitlab-muted text-xs">
          GitLab AI Orchestrator · Built for GitLab AI Hackathon 2026 · Powered by Claude AI
        </div>
      </footer>
    </div>
  );
}
