"use client"

import { useEffect, useState } from "react"

export function NotificationBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const load = () =>
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((d: { count?: number }) => setCount(d.count ?? 0))
        .catch(() => {})

    void load()
    const interval = setInterval(() => { void load() }, 30_000)

    const handler = () => { void load() }
    window.addEventListener("notifications-read", handler)

    return () => {
      clearInterval(interval)
      window.removeEventListener("notifications-read", handler)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
      {count > 9 ? "9+" : count}
    </span>
  )
}
