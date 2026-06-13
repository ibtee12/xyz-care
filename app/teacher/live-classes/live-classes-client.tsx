"use client"

import { useState } from "react"
import { Video, Plus, Trash2, ExternalLink, Calendar, Clock, Users } from "lucide-react"

type LiveClass = {
  id: string
  title: string
  description: string | null
  meet_link: string
  scheduled_at: string
  join_window_minutes: number
  duration: number | null
  course: { id: string; title: string }
}

type Course = { id: string; title: string }

type ClassStatus = "upcoming" | "open" | "ended"

function getStatus(scheduledAt: string, windowMinutes: number): ClassStatus {
  const start = new Date(scheduledAt).getTime()
  const now = Date.now()
  const windowEnd = start + windowMinutes * 60_000
  if (now < start) return "upcoming"
  if (now <= windowEnd) return "open"
  return "ended"
}

function StatusBadge({ status }: { status: ClassStatus }) {
  if (status === "upcoming") return <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-700">Upcoming</span>
  if (status === "open") return <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />Live Now</span>
  return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-gray-400">Ended</span>
}

export function TeacherLiveClassesClient({
  classes: initial,
  courses,
}: {
  classes: LiveClass[]
  courses: Course[]
}) {
  const [classes, setClasses] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [courseId, setCourseId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [meetLink, setMeetLink] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [joinWindow, setJoinWindow] = useState("30")
  const [duration, setDuration] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setCourseId(""); setTitle(""); setDescription(""); setMeetLink("")
    setScheduledAt(""); setJoinWindow("30"); setDuration(""); setError("")
  }

  const submit = async () => {
    if (!courseId || !title || !meetLink || !scheduledAt) {
      setError("Course, title, meeting link and start time are required.")
      return
    }
    if (new Date(scheduledAt) < new Date()) {
      setError("Scheduled time must be in the future.")
      return
    }
    setSaving(true); setError("")
    const res = await fetch("/api/teacher/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId, title, description, meet_link: meetLink,
        scheduled_at: scheduledAt,
        join_window_minutes: Number(joinWindow) || 30,
        duration: duration ? Number(duration) : undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Failed."); setSaving(false); return }
    setClasses((prev) =>
      [...prev, data.liveClass].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )
    )
    reset(); setShowForm(false); setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this live class? Students will be notified it was cancelled.")) return
    await fetch(`/api/teacher/live-classes/${id}`, { method: "DELETE" })
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  const upcoming = classes.filter((c) => getStatus(c.scheduled_at, c.join_window_minutes) === "upcoming")
  const open = classes.filter((c) => getStatus(c.scheduled_at, c.join_window_minutes) === "open")
  const ended = classes.filter((c) => getStatus(c.scheduled_at, c.join_window_minutes) === "ended")

  const sections = [
    { label: "Live Now", items: open },
    { label: "Upcoming", items: upcoming },
    { label: "Ended", items: ended },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Live Classes</h1>
          <p className="mt-1 text-sm text-gray-500">Schedule sessions with a join window — students can only access the link during that window.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="size-4" /> Schedule Class
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-indigo-100 space-y-4">
          <h2 className="font-bold text-gray-800">New Live Class</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course *</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">Select course…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Session Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Algebra Chapter 5 Revision"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Zoom / Google Meet Link *</label>
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/... or https://zoom.us/..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class Starts At *</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Last Check-in (minutes after start) *
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={joinWindow}
                onChange={(e) => setJoinWindow(e.target.value)}
                placeholder="30"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                Students can join from start time up to this many minutes later. After that the link is hidden.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Duration (minutes, optional)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="90"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief topic overview"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Timeline preview */}
          {scheduledAt && joinWindow && (
            <div className="rounded-xl bg-indigo-50 p-4 text-xs text-indigo-700">
              <p className="font-bold mb-1">Timeline preview</p>
              <p>🟢 Join opens: {new Date(scheduledAt).toLocaleString()}</p>
              <p>🔴 Join closes: {new Date(new Date(scheduledAt).getTime() + Number(joinWindow) * 60_000).toLocaleString()}</p>
              <p className="mt-1 text-indigo-500">Students who don&apos;t join within this window cannot access the link.</p>
            </div>
          )}

          {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create & Notify Students"}
            </button>
            <button
              onClick={() => { reset(); setShowForm(false) }}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {sections.map(({ label, items }) =>
        items.length > 0 ? (
          <div key={label} className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">{label}</h2>
            {items.map((lc) => {
              const status = getStatus(lc.scheduled_at, lc.join_window_minutes)
              const joinDeadline = new Date(new Date(lc.scheduled_at).getTime() + lc.join_window_minutes * 60_000)
              return (
                <div
                  key={lc.id}
                  className={`flex items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ${
                    status === "open" ? "ring-emerald-200" : status === "upcoming" ? "ring-indigo-100" : "ring-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      status === "open" ? "bg-emerald-50 text-emerald-600" :
                      status === "upcoming" ? "bg-indigo-50 text-indigo-600" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      <Video className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{lc.title}</p>
                        <StatusBadge status={status} />
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">{lc.course.title}</p>
                      {lc.description && <p className="mt-1 text-xs text-gray-500">{lc.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          Starts: {new Date(lc.scheduled_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          Last join: {joinDeadline.toLocaleString()}
                        </span>
                        {lc.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" /> {lc.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={lc.meet_link.startsWith("http") ? lc.meet_link : `https://${lc.meet_link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <ExternalLink className="size-3" /> Open Link
                    </a>
                    <button
                      onClick={() => remove(lc.id)}
                      className="rounded-xl p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null
      )}

      {classes.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <Video className="mb-3 size-10 text-gray-200" />
          <p className="font-semibold text-gray-400">No classes scheduled yet.</p>
          <p className="mt-1 text-sm text-gray-300">Click "Schedule Class" to create your first session.</p>
        </div>
      )}
    </div>
  )
}
