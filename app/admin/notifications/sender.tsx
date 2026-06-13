"use client"

import { FormEvent, useState } from "react"
import { Send, MessageSquare, Mail, Globe, Users, Hash, CheckCircle2 } from "lucide-react"

type Channel = "sms" | "email" | "website" | "all"
type Target = "all" | "roll"

export function NotificationSender() {
  const [channel, setChannel] = useState<Channel>("sms")
  const [target, setTarget] = useState<Target>("all")
  const [rollNumber, setRollNumber] = useState("")
  const [subject, setSubject] = useState("Matrix Math Care Notification")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [isError, setIsError] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("")
    setIsSending(true)
    const payload = { message, target, rollNumber: target === "roll" ? rollNumber : undefined, subject }
    const responses: Array<{ ok: boolean; label: string; error?: string }> = []
    try {
      if (channel === "sms" || channel === "all") {
        const r = await fetch("/api/notifications/sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        const d = (await r.json()) as { error?: string }
        responses.push({ ok: r.ok, label: "SMS", error: d.error })
      }
      if (channel === "email" || channel === "all") {
        const r = await fetch("/api/notifications/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        const d = (await r.json()) as { error?: string }
        responses.push({ ok: r.ok, label: "Email", error: d.error })
      }
      if (channel === "website" || channel === "all") {
        const r = await fetch("/api/notifications/website", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        const d = (await r.json()) as { error?: string }
        responses.push({ ok: r.ok, label: "Website", error: d.error })
      }
    } catch {
      setStatus("Network error while sending notifications.")
      setIsError(true)
      setIsSending(false)
      return
    }
    const failed = responses.filter((r) => !r.ok)
    if (failed.length > 0) {
      setStatus(failed.map((r) => `${r.label}: ${r.error ?? "Unknown error"}`).join(" · "))
      setIsError(true)
    } else {
      setStatus("Notification sent successfully.")
      setIsError(false)
      setMessage("")
      if (target === "roll") setRollNumber("")
    }
    setIsSending(false)
  }

  const channelOpts: { value: Channel; label: string; icon: typeof MessageSquare }[] = [
    { value: "sms", label: "SMS", icon: MessageSquare },
    { value: "email", label: "Email", icon: Mail },
    { value: "website", label: "Website", icon: Globe },
    { value: "all", label: "ALL", icon: Send },
  ]
  const targetOpts: { value: Target; label: string; icon: typeof Users }[] = [
    { value: "all", label: "All students", icon: Users },
    { value: "roll", label: "By roll number", icon: Hash },
  ]

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* Channel */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Channel</label>
        <div className="flex flex-wrap gap-2">
          {channelOpts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChannel(opt.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${channel === opt.value ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <opt.icon className="size-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Recipient</label>
        <div className="flex flex-wrap gap-2">
          {targetOpts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTarget(opt.value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${target === opt.value ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <opt.icon className="size-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {target === "roll" ? (
        <div className="space-y-1.5">
          <label htmlFor="roll-number" className="text-sm font-semibold text-gray-700">Roll Number</label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              id="roll-number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="S-1023"
              required
              className="w-full max-w-xs rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      ) : null}

      {channel === "email" || channel === "all" ? (
        <div className="space-y-1.5">
          <label htmlFor="email-subject" className="text-sm font-semibold text-gray-700">Email Subject</label>
          <input
            id="email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="notif-message" className="text-sm font-semibold text-gray-700">Message</label>
        <textarea
          id="notif-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Type your announcement…"
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {status ? (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {!isError ? <CheckCircle2 className="size-4" /> : null}
          {status}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSending}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Send className="size-4" />
        {isSending ? "Sending…" : "Send Notification"}
      </button>
    </form>
  )
}
