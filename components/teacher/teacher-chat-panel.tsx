"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Image as ImageIcon, Send, X } from "lucide-react"

import { Avatar } from "@/components/shared/avatar"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

export type TeacherChatStudent = {
  id: string
  name: string
  roll_number: string | null
  lastMessageAt?: string | null
}

type ApiMessage = {
  id: string
  message: string
  image_url?: string | null
  created_at: string
  sender_id: string
  sender: { id: string; name: string }
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" })
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function TeacherChatPanel({
  students: initialStudents,
  teacherId,
}: {
  students: TeacherChatStudent[]
  teacherId: string
}) {
  const [students, setStudents] = useState(initialStudents)
  const [selectedId, setSelectedId] = useState(initialStudents[0]?.id ?? "")
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    if (!selectedId) { setMessages([]); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/teacher/messages?withUserId=${encodeURIComponent(selectedId)}`)
      const data = (await res.json()) as { messages?: ApiMessage[]; error?: string }
      if (!res.ok) { setError(data.error ?? "Could not load messages."); setMessages([]); return }
      const msgs = data.messages ?? []
      setMessages(msgs)
      // Update last message time for this student in the sidebar
      if (msgs.length > 0) {
        const lastAt = msgs[msgs.length - 1].created_at
        setStudents((prev) =>
          [...prev.map((s) => s.id === selectedId ? { ...s, lastMessageAt: lastAt } : s)]
            .sort((a, b) => {
              if (!a.lastMessageAt && !b.lastMessageAt) return a.name.localeCompare(b.name)
              if (!a.lastMessageAt) return 1
              if (!b.lastMessageAt) return -1
              return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            })
        )
      }
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    const handle = window.setTimeout(() => { void loadMessages() }, 0)
    return () => window.clearTimeout(handle)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const send = async () => {
    const text = draft.trim()
    if (!selectedId || (!text && !imageFile)) return
    setSending(true)
    setError("")
    try {
      let uploadedImageUrl: string | null = null

      if (imageFile) {
        const fd = new FormData()
        fd.append("file", imageFile)
        const upRes = await fetch("/api/upload-image", { method: "POST", body: fd })
        const upData = (await upRes.json()) as { url?: string; error?: string }
        if (!upRes.ok || !upData.url) {
          setError(upData.error ?? "Could not upload image.")
          setSending(false)
          return
        }
        uploadedImageUrl = upData.url
      }

      const res = await fetch("/api/teacher/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedId,
          message: text || " ",
          image_url: uploadedImageUrl,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) { setError(data.error ?? "Could not send."); setSending(false); return }
      setDraft("")
      clearImage()
      await loadMessages()
    } finally {
      setSending(false)
    }
  }

  if (students.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        No students enrolled in your courses yet.
      </p>
    )
  }

  const selectedStudent = students.find((s) => s.id === selectedId)

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
      {/* Student list — sorted newest conversation first */}
      <div className="rounded-2xl bg-gray-50 p-2 ring-1 ring-gray-100 max-h-96 overflow-y-auto lg:max-h-[32rem]">
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${selectedId === s.id ? "bg-teal-600 text-white" : "hover:bg-white"}`}
          >
            <Avatar name={s.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${selectedId === s.id ? "text-white" : "text-gray-800"}`}>{s.name}</p>
              <div className="flex items-center justify-between gap-1">
                <p className={`text-xs ${selectedId === s.id ? "text-teal-200" : "text-gray-400"}`}>
                  {s.roll_number ? `Roll ${s.roll_number}` : "No roll"}
                </p>
                {s.lastMessageAt && (
                  <p className={`shrink-0 text-[10px] ${selectedId === s.id ? "text-teal-200" : "text-gray-400"}`}>
                    {formatTime(s.lastMessageAt)}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex min-h-[24rem] flex-col rounded-2xl bg-white ring-1 ring-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
          {selectedStudent ? (
            <>
              <Avatar name={selectedStudent.name} size="sm" />
              <span className="font-semibold text-gray-800">{selectedStudent.name}</span>
            </>
          ) : null}
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <LoadingSpinner />
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No messages yet. Say hello below.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === teacherId
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                    {!mine ? <p className="mb-1 text-xs font-bold text-teal-600">{m.sender.name}</p> : null}
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt="attachment"
                        className="mb-2 max-w-[240px] rounded-xl object-cover"
                      />
                    )}
                    {m.message.trim() && (
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                    )}
                    <p className={`mt-1 text-[10px] ${mine ? "text-teal-100" : "text-gray-400"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          {error ? <p className="mb-2 text-xs text-red-500">{error}</p> : null}

          {/* Image preview */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="preview" className="max-h-24 rounded-xl border border-gray-200 object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-500"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Image attach */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600"
              title="Attach image"
            >
              <ImageIcon className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send() }
              }}
            />
            <button
              type="button"
              disabled={sending || (!draft.trim() && !imageFile)}
              onClick={() => void send()}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
