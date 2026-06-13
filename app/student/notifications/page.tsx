"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Globe, Mail, MessageSquare, AlertTriangle, ChevronRight } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"

type Notification = {
  id: string
  type: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

function typeIcon(type: string) {
  const t = type.toLowerCase()
  if (t === "email") return <Mail className="size-4 text-indigo-500" />
  if (t === "sms") return <MessageSquare className="size-4 text-cyan-500" />
  if (t === "website") return <Globe className="size-4 text-emerald-500" />
  if (t === "alert" || t === "warning") return <AlertTriangle className="size-4 text-amber-500" />
  return <Bell className="size-4 text-violet-500" />
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications/list")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .finally(() => setLoading(false))

    // Mark all as read and notify the bell badge to refresh immediately
    fetch("/api/notifications/unread-count", { method: "POST" })
      .then(() => window.dispatchEvent(new Event("notifications-read")))
      .catch(() => {})
  }, [])

  // Optimistically show all as read in UI
  const displayed = notifications.map((n) => ({ ...n, is_read: true }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Messages sent to you by the Matrix Math Care team.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="size-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={Bell} title="No notifications yet" description="You will see notifications here when the admin sends you updates." />
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
            >
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                {typeIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                    {n.type}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700">{n.message}</p>
                {n.link && (
                  <Link
                    href={n.link}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    View Details <ChevronRight className="size-3" />
                  </Link>
                )}
                <p className="mt-2 text-[10px] font-medium text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
