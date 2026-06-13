"use client"

import Link from "next/link"
import { useState } from "react"
import { MessageSquare, Plus, Lock, User, ChevronRight, X } from "lucide-react"

type Thread = {
  id: string
  title: string
  content: string
  is_locked: boolean
  created_at: string
  author: { name: string; role: string }
  replyCount: number
}

export function ForumClient({ userId, threads: initial }: { userId: string; threads: Thread[] }) {
  const [threads, setThreads] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = threads.filter(
    (t) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase())
  )

  const submit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setPosting(true)
    const res = await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    })
    const data = await res.json()
    if (res.ok) {
      setThreads((prev) => [{ ...data.thread, replyCount: 0 }, ...prev])
      setNewTitle(""); setNewContent(""); setShowNew(false)
    }
    setPosting(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Discussion Forum</h1>
          <p className="mt-1 text-sm text-gray-500">Ask questions, share insights, help others.</p>
        </div>
        <button onClick={() => setShowNew((v) => !v)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
          {showNew ? <X className="size-4" /> : <Plus className="size-4" />} {showNew ? "Cancel" : "New Thread"}
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">Start a Discussion</h2>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Thread title…"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <textarea
            rows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Describe your question or topic…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
          <button onClick={submit} disabled={posting || !newTitle.trim() || !newContent.trim()} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            {posting ? "Posting…" : "Post Thread"}
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search threads…"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <MessageSquare className="mb-3 size-10 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">{search ? "No threads match your search." : "No threads yet. Start the first discussion!"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href={`/student/forum/${t.id}`}
              className="group flex items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-indigo-200 hover:shadow-md"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {t.is_locked && <Lock className="size-3.5 shrink-0 text-amber-500" />}
                  <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">{t.title}</h3>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{t.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><User className="size-3" />{t.author.name}</span>
                  <span>·</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <div className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                  <MessageSquare className="size-3" /> {t.replyCount}
                </div>
                <ChevronRight className="size-4 text-gray-300 group-hover:text-indigo-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
