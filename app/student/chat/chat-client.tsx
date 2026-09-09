"use client"

import { useEffect, useRef, useState } from "react"
import { Image as ImageIcon, MessageSquare, Send, BookOpen, X } from "lucide-react"

type Teacher = { id: string; name: string; email: string; courseTitle: string }
type Message = {
  id: string
  message: string
  image_url?: string | null
  created_at: string
  sender: { id: string; name: string }
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white ${size === "sm" ? "size-8 text-xs" : "size-10 text-sm"}`}>
      {initials}
    </div>
  )
}

export function StudentChatClient({
  studentId,
  teachers,
}: {
  studentId: string
  studentName?: string
  teachers: Teacher[]
}) {
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(teachers[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(teachers.length > 0)
  const [sending, setSending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeTeacher) return
    let ignore = false
    fetch(`/api/student/chat?withUserId=${activeTeacher.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) setMessages(d.messages ?? [])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [activeTeacher])

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
    if ((!input.trim() && !imageFile) || !activeTeacher || sending) return
    setSending(true)
    const text = input.trim()
    setInput("")

    let uploadedImageUrl: string | null = null
    if (imageFile) {
      const fd = new FormData()
      fd.append("file", imageFile)
      const upRes = await fetch("/api/upload-image", { method: "POST", body: fd })
      const upData = (await upRes.json()) as { url?: string; error?: string }
      if (upRes.ok && upData.url) {
        uploadedImageUrl = upData.url
      }
      clearImage()
    }

    const res = await fetch("/api/student/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: activeTeacher.id,
        message: text || " ",
        image_url: uploadedImageUrl,
      }),
    })
    const data = await res.json()
    if (data.message) setMessages((prev) => [...prev, data.message])
    setSending(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Chat</h1>
        <p className="mt-1 text-sm text-gray-500">Message your teachers directly.</p>
      </div>

      {teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-50">
            <MessageSquare className="size-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No teachers yet</h3>
          <p className="mt-1 text-sm text-gray-400">Enroll in a course to chat with its teacher.</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-13rem)]">
          {/* Teacher list */}
          <div className="hidden w-72 shrink-0 flex-col gap-2 overflow-y-auto lg:flex">
            {teachers.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTeacher(t)
                  setLoading(true)
                }}
                className={`flex items-center gap-3 rounded-2xl p-4 text-left transition-all ${
                  activeTeacher?.id === t.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-indigo-50 shadow-sm"
                }`}
              >
                <Avatar name={t.name} />
                <div className="min-w-0">
                  <p className={`truncate text-sm font-bold ${activeTeacher?.id === t.id ? "text-white" : "text-gray-800"}`}>{t.name}</p>
                  <div className={`flex items-center gap-1 mt-0.5 ${activeTeacher?.id === t.id ? "text-indigo-200" : "text-gray-400"}`}>
                    <BookOpen className="size-3" />
                    <p className="truncate text-[11px]">{t.courseTitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            {activeTeacher && (
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <Avatar name={activeTeacher.name} />
                <div>
                  <p className="text-sm font-bold text-gray-800">{activeTeacher.name}</p>
                  <p className="text-xs text-gray-400">{activeTeacher.courseTitle}</p>
                </div>
                {/* Mobile teacher selector */}
                <select
                  className="ml-auto rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 lg:hidden"
                  value={activeTeacher.id}
                  onChange={(e) => setActiveTeacher(teachers.find((t) => t.id === e.target.value) ?? null)}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="size-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="size-10 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender.id === studentId
                  return (
                    <div key={m.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMe && <Avatar name={m.sender.name} size="sm" />}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? "rounded-tr-sm bg-indigo-600 text-white" : "rounded-tl-sm bg-gray-100 text-gray-800"}`}>
                        {m.image_url && (
                          <img
                            src={m.image_url}
                            alt="attachment"
                            className="mb-2 max-w-[200px] rounded-xl object-cover"
                          />
                        )}
                        {m.message.trim() && (
                          <p className="text-sm leading-relaxed">{m.message}</p>
                        )}
                        <p className={`mt-1 text-[10px] ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
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
            <div className="border-t border-gray-100 px-4 py-3">
              {/* Image preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="preview" className="max-h-20 rounded-xl border border-gray-200 object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-red-500"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                {/* Image attach button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
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
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
                <button
                  onClick={() => void send()}
                  disabled={(!input.trim() && !imageFile) || sending}
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-gray-300">Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
