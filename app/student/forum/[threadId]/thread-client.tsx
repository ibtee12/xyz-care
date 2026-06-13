"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, MessageSquare, Lock, Send, User, Shield } from "lucide-react"

type Author = { id: string; name: string; role: string }
type Reply = { id: string; content: string; created_at: string; author: Author }
type Thread = {
  id: string
  title: string
  content: string
  is_locked: boolean
  created_at: string
  author: Author
  replies: Reply[]
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") return <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-black text-violet-700 uppercase tracking-wide">Admin</span>
  if (role === "teacher") return <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-black text-teal-700 uppercase tracking-wide">Teacher</span>
  return null
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
      {name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  )
}

export function ThreadDetailClient({ userId, thread: initial }: { userId: string; thread: Thread }) {
  const [replies, setReplies] = useState(initial.replies)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)

  const submit = async () => {
    if (!content.trim() || initial.is_locked) return
    setPosting(true)
    const res = await fetch(`/api/forum/${initial.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (res.ok) { setReplies((prev) => [...prev, data.reply]); setContent("") }
    setPosting(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/student/forum" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="size-4" /> Back to Forum
      </Link>

      {/* Thread */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          {initial.is_locked && <Lock className="size-4 text-amber-500" />}
          <h1 className="text-xl font-extrabold text-gray-900">{initial.title}</h1>
        </div>
        <div className="flex items-start gap-3">
          <Avatar name={initial.author.name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{initial.author.name}</span>
              <RoleBadge role={initial.author.role} />
              <span className="text-xs text-gray-400">{new Date(initial.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{initial.content}</p>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-gray-400">
          <MessageSquare className="size-4" /> {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>

        {replies.map((r, i) => (
          <div key={r.id} className={`flex items-start gap-3 rounded-2xl p-5 ${r.author.id === userId ? "bg-indigo-50 ring-1 ring-indigo-100" : "bg-white shadow-sm ring-1 ring-gray-100"}`}>
            <Avatar name={r.author.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">{r.author.name}</span>
                <RoleBadge role={r.author.role} />
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{r.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {initial.is_locked ? (
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-700">
          <Lock className="size-4" /> This thread is locked. No new replies.
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Add a Reply</h3>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reply…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
          <button onClick={submit} disabled={posting || !content.trim()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            <Send className="size-4" /> {posting ? "Posting…" : "Post Reply"}
          </button>
        </div>
      )}
    </div>
  )
}
