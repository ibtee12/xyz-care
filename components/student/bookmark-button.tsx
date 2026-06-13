"use client"

import { useState } from "react"
import { Bookmark } from "lucide-react"

export function BookmarkButton({ lessonId, initial }: { lessonId: string; initial: boolean }) {
  const [bookmarked, setBookmarked] = useState(initial)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    const next = !bookmarked
    setBookmarked(next)
    try {
      if (next) {
        await fetch("/api/student/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        })
      } else {
        await fetch(`/api/student/bookmarks?lessonId=${lessonId}`, { method: "DELETE" })
      }
    } catch {
      setBookmarked(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? "Remove bookmark" : "Bookmark this lesson"}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
        bookmarked
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <Bookmark className={`size-3.5 ${bookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  )
}
