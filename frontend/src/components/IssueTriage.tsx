'use client'

import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const EXAMPLE_ISSUES = [
  { title: 'Login page throws 500 error after OAuth redirect', description: 'Users are unable to log in via GitLab OAuth. The redirect URL returns a 500 Internal Server Error. This started after the last deploy.' },
  { title: 'Add dark mode support to the dashboard', description: 'Users have requested a dark mode toggle for the main dashboard. Should respect system preferences and persist user choice.' },
  { title: 'CI pipeline takes 45 minutes — needs optimization', description: 'Our CI pipeline has grown to 45 minutes. We need to parallelize jobs and cache dependencies better.' },
]

interface TriageResult {
  priority: string
  labels: string[]
  suggested_assignee: string
  summary: string
}

export default function IssueTriage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState('')

  const priorityBadge: Record<string, string> = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_title: title, issue_body: description }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setResult(await res.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to triage issue')
    } finally {
      setLoading(false)
    }
  }

  function loadExample(ex: typeof EXAMPLE_ISSUES[0]) {
    setTitle(ex.title)
    setDescription(ex.description)
    setResult(null)
    setError('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">🔍 Issue Triage</h3>
        <p className="text-[#9B9A9F] text-sm mb-6">
          Paste any GitLab issue to get AI-powered priority, labels, and assignee suggestion.
        </p>

        {/* Examples */}
        <div className="mb-6">
          <p className="text-xs text-[#9B9A9F] mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_ISSUES.map((ex, i) => (
              <button
                key={i}
                onClick={() => loadExample(ex)}
                className="text-xs bg-[#252429] hover:bg-[#383640] text-[#9B9A9F] hover:text-white px-3 py-1.5 rounded-lg border border-[#383640] transition-colors"
              >
                {ex.title.slice(0, 35)}…
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9B9A9F] mb-1">Issue Title *</label>
            <input
              className="input-field"
              placeholder="e.g. Login page throws 500 error after OAuth redirect"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#9B9A9F] mb-1">Description</label>
            <textarea
              className="input-field h-28 resize-none"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading || !title.trim()} className="btn-primary w-full">
            {loading ? (
              <><span className="spinner mr-2"></span>Analyzing...</>
            ) : (
              '🔍 Triage Issue'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      <div>
        {result ? (
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">Triage Result</h4>
              <span className={priorityBadge[result.priority?.toLowerCase()] || 'badge-medium'}>
                {result.priority?.toUpperCase()}
              </span>
            </div>

            <div>
              <p className="text-xs text-[#9B9A9F] mb-1">AI Summary</p>
              <p className="text-[#FAFAFA] text-sm leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#9B9A9F] mb-2">Labels</p>
                <div className="flex flex-wrap gap-1">
                  {result.labels?.map((l, i) => (
                    <span key={i} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#9B9A9F] mb-1">Suggested Assignee</p>
                <p className="text-[#FAFAFA] text-sm font-mono">{result.suggested_assignee}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[#9B9A9F]">Submit an issue to see AI triage results</p>
            <p className="text-[#383640] text-sm mt-1">Priority • Labels • Assignee</p>
          </div>
        )}
      </div>
    </div>
  )
}
