"use client"

import Link from "next/link"
import { useState } from "react"
import { MapPin, Calendar, Layers, PlayCircle, Search, X } from "lucide-react"

type CourseData = {
  id: string
  title: string
  description: string | null
  slug: string
  course_type: string
  location: string | null
  schedule: string | null
  batch: string | null
  _count: { lessons: number }
}

type Enrollment = {
  id: string
  progress: number
  course: CourseData
}

export function StudentCoursesClient({ enrollments }: { enrollments: Enrollment[] }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all")

  const filtered = enrollments.filter((e) => {
    const matchesType = filter === "all" || e.course.course_type === filter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      e.course.title.toLowerCase().includes(q) ||
      (e.course.description ?? "").toLowerCase().includes(q)
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-5">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 text-sm font-semibold">
          {(["all", "online", "offline"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-lg px-4 py-1.5 capitalize transition-all ${
                filter === t ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-sm text-center">
          <Search className="mb-3 size-8 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">No courses match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((enrollment) => {
            const course = enrollment.course
            const isOffline = course.course_type === "offline"

            return (
              <div
                key={enrollment.id}
                className={`group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md ${
                  isOffline ? "hover:ring-amber-200" : "hover:ring-indigo-200"
                }`}
              >
                <div className={`h-2.5 w-full ${isOffline ? "bg-amber-500" : "bg-indigo-600"}`} />
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${isOffline ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {course.course_type}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {course.title}
                  </h2>

                  {isOffline ? (
                    <div className="mt-4 space-y-3">
                      {[
                        { icon: MapPin, val: course.location || "Venue TBA" },
                        { icon: Calendar, val: course.schedule || "Schedule TBA" },
                        { icon: Layers, val: course.batch || "Batch TBA" },
                      ].map(({ icon: Icon, val }) => (
                        <div key={val} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600"><Icon className="size-4" /></div>
                          <span className="font-medium truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                        {course.description ?? "Access your recorded classes and course materials."}
                      </p>
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400">Progress</span>
                          <span className="text-xs font-black text-indigo-700">{enrollment.progress}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-50">
                          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-gray-400">{course._count.lessons} Recorded Lessons</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                        isOffline
                          ? "bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                      }`}
                    >
                      {isOffline ? "View Course Details" : (
                        <><PlayCircle className="size-4" />{enrollment.progress === 0 ? "Start Learning" : "Continue Class"}</>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
