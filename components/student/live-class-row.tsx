"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, ExternalLink, Lock, User, Video } from "lucide-react"

type Props = {
  id: string
  title: string
  description: string | null
  meetLink: string
  scheduledAt: string
  joinWindowMinutes: number
  duration: number | null
  teacherName: string
}

type Status = "not_started" | "open" | "ended"

function getStatus(scheduledAt: string, windowMinutes: number): Status {
  const start = new Date(scheduledAt).getTime()
  const now = Date.now()
  const windowEnd = start + windowMinutes * 60_000
  if (now < start) return "not_started"
  if (now <= windowEnd) return "open"
  return "ended"
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function useCountdown(targetIso: string) {
  const [diff, setDiff] = useState(() => new Date(targetIso).getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(new Date(targetIso).getTime() - Date.now())
    }, 1_000)
    return () => clearInterval(id)
  }, [targetIso])

  if (diff <= 0) return null
  const totalSec = Math.floor(diff / 1_000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${pad(m)}m`
  if (m > 0) return `${pad(m)}m ${pad(s)}s`
  return `${pad(s)}s`
}

export function LiveClassRow({
  title,
  description,
  meetLink,
  scheduledAt,
  joinWindowMinutes,
  duration,
  teacherName,
}: Props) {
  const [status, setStatus] = useState<Status>(() =>
    getStatus(scheduledAt, joinWindowMinutes)
  )

  const joinDeadlineIso = new Date(
    new Date(scheduledAt).getTime() + joinWindowMinutes * 60_000
  ).toISOString()

  // Countdown to start (when not_started) or to join deadline (when open)
  const countdownTarget = status === "not_started" ? scheduledAt : joinDeadlineIso
  const countdown = useCountdown(countdownTarget)

  // Tick status every second
  useEffect(() => {
    const id = setInterval(() => {
      setStatus(getStatus(scheduledAt, joinWindowMinutes))
    }, 1_000)
    return () => clearInterval(id)
  }, [scheduledAt, joinWindowMinutes])

  return (
    <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            status === "open"
              ? "bg-emerald-50 text-emerald-600"
              : status === "not_started"
              ? "bg-indigo-50 text-indigo-500"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          <Video className="size-5" />
        </div>
        <div>
          <p className={`font-bold ${status === "ended" ? "text-gray-400" : "text-gray-800"}`}>
            {title}
          </p>
          {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(scheduledAt).toLocaleString("en-BD", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> {duration} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="size-3" /> {teacherName}
            </span>
          </div>

          {/* Status indicator line */}
          {status === "not_started" && countdown && (
            <p className="mt-1.5 text-xs font-semibold text-indigo-500">
              Starts in {countdown} · Join window: {joinWindowMinutes} min after start
            </p>
          )}
          {status === "open" && countdown && (
            <p className="mt-1.5 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live now · Join closes in {countdown}
            </p>
          )}
          {status === "ended" && (
            <p className="mt-1.5 text-xs font-semibold text-gray-400">
              Join window closed · {new Date(joinDeadlineIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Action button — right side */}
      <div className="shrink-0">
        {status === "open" ? (
          <a
            href={meetLink.startsWith("http") ? meetLink : `https://${meetLink}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <ExternalLink className="size-4" /> Join Now
          </a>
        ) : status === "not_started" ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-400 cursor-not-allowed select-none">
            <Lock className="size-4" /> Not Started
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-400 cursor-not-allowed select-none">
            <Lock className="size-4" /> Ended
          </div>
        )}
      </div>
    </div>
  )
}
