"use client"

import { FormEvent, useState } from "react"
import { Send, User, Mail, MessageSquare, CheckCircle2 } from "lucide-react"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSent(true)
    setName("")
    setEmail("")
    setMessage("")
    setIsSubmitting(false)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-8 text-emerald-500" />
        </div>
        <p className="text-lg font-bold text-gray-800">Message sent!</p>
        <p className="text-sm text-gray-500">
          Thanks for reaching out. Our team will contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="cf-name" className="text-sm font-medium text-gray-700">
          Full name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            id="cf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cf-email" className="text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cf-message" className="text-sm font-medium text-gray-700">
          Message
        </label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3 size-4 text-gray-400" />
          <textarea
            id="cf-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you need help with…"
            rows={4}
            required
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Send className="size-4" />
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  )
}
