"use client";

import { useState } from "react";
import IssueTriage from "@/components/IssueTriage";
import FixSuggester from "@/components/FixSuggester";
import PipelineMonitor from "@/components/PipelineMonitor";
import MRReviewer from "@/components/MRReviewer";

const TABS = [
  { id: "triage", label: "Issue Triage", icon: "🔍" },
  { id: "fix", label: "Fix Suggester", icon: "🔧" },
  { id: "pipeline", label: "Pipeline Monitor", icon: "⚡" },
  { id: "mr", label: "MR Reviewer", icon: "📋" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("triage");

  return (
    <div className="min-h-screen bg-[#141217]">
      {/* Header */}
      <header className="border-b border-[#383640] bg-[#1F1E24]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FC6D26] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">GitLab AI Orchestrator</h1>
              <p className="text-[#9B9A9F] text-xs">AI-powered DevOps assistant</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-[#FC6D26]/10 text-[#FC6D26] text-xs font-medium border border-[#FC6D26]/20">
              ✦ AI Powered
            </span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="border-b border-[#383640] bg-[#1F1E24]">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-[#FC6D26] text-[#FC6D26]"
                    : "border-transparent text-[#9B9A9F] hover:text-white hover:border-[#383640]"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "triage" && <IssueTriage />}
        {activeTab === "fix" && <FixSuggester />}
        {activeTab === "pipeline" && <PipelineMonitor />}
        {activeTab === "mr" && <MRReviewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#383640] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-[#9B9A9F] text-xs">GitLab AI Orchestrator — GitLab AI Hackathon 2026</p>
          <p className="text-[#9B9A9F] text-xs">Powered by Claude AI</p>
        </div>
      </footer>
    </div>
  );
}
