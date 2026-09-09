"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BookOpen, CheckCircle2, ChevronDown, Loader2, Save, Users } from "lucide-react"

type Course = { id: string; title: string }
type Student = { id: string; name: string; roll_number: string; email: string }

export function MarksUploadForm({ courses }: { courses: Course[] }) {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [courseId, setCourseId] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [totalMarks, setTotalMarks] = useState("")
  const [examDate, setExamDate] = useState("")

  const [students, setStudents] = useState<Student[]>([])
  const [marks, setMarks] = useState<Record<string, { value: string; remarks: string }>>({})
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!courseId) return
    let ignore = false
    fetch(`/api/admin/enrolled-students?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (ignore) return
        const list: Student[] = data.students ?? []
        setStudents(list)
        setMarks(Object.fromEntries(list.map((s) => [s.id, { value: "", remarks: "" }])))
      })
      .finally(() => {
        if (!ignore) setLoadingStudents(false)
      })
    return () => {
      ignore = true
    }
  }, [courseId])

  const setMark = (studentId: string, value: string) =>
    setMarks((prev) => ({ ...prev, [studentId]: { ...prev[studentId], value } }))

  const setRemarks = (studentId: string, remarks: string) =>
    setMarks((prev) => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }))

  const filledCount = students.filter(
    (s) => marks[s.id]?.value !== "" && marks[s.id]?.value !== undefined
  ).length

  const handleSubmit = async () => {
    setError(""); setSuccess("")
    if (!title.trim()) { setError("Exam title is required."); return }
    if (!courseId) { setError("Please select a course."); return }
    if (!totalMarks || Number(totalMarks) < 1) { setError("Total marks must be at least 1."); return }
    if (!examDate) { setError("Exam date is required."); return }

    const marksPayload = students
      .filter((s) => marks[s.id]?.value !== "")
      .map((s) => ({
        student_id: s.id,
        roll_number: s.roll_number,
        marks_obtained: Number(marks[s.id]?.value ?? 0),
        remarks: marks[s.id]?.remarks ?? "",
      }))

    if (marksPayload.length === 0) {
      setError("Enter marks for at least one student.")
      return
    }

    setSubmitting(true)
    const res = await fetch("/api/marks/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exam: { title, subject: courseTitle, total_marks: Number(totalMarks), exam_date: examDate },
        marks: marksPayload,
      }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? "Failed to save."); return }
    setSuccess(`Exam created! Saved marks for ${data.insertedCount} student${data.insertedCount !== 1 ? "s" : ""}.`)
    setTimeout(() => router.push("/admin/marks"), 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Create Exam & Enter Marks</h1>
        <p className="mt-1 text-sm text-gray-500">Select a course, fill in exam details, then enter each student&apos;s marks.</p>
      </div>

      {/* Exam details card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-5">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="size-4 text-indigo-500" /> Exam Details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Unit Test"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Course */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course (Subject)</label>
            <div className="relative">
              <select
                value={courseId}
                onChange={(e) => {
                  const id = e.target.value
                  const course = courses.find((c) => c.id === id)
                  setCourseId(id)
                  setCourseTitle(course?.title ?? "")
                  if (!id) {
                    setStudents([])
                    setMarks({})
                    setLoadingStudents(false)
                  } else {
                    setLoadingStudents(true)
                  }
                }}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select a published course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Total Marks */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Marks</label>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="100"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Students marks section */}
      {courseId && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="size-4 text-indigo-500" />
              Enrolled Students
              {students.length > 0 && (
                <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-black text-indigo-700">
                  {students.length}
                </span>
              )}
            </h2>
            {students.length > 0 && (
              <span className="text-xs font-medium text-gray-400">
                {filledCount}/{students.length} filled
              </span>
            )}
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
              <Loader2 className="size-4 animate-spin" /> Loading students…
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No students enrolled in this course yet.
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-12 gap-3 border-b border-gray-50 bg-gray-50/70 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2">Roll No.</div>
                <div className="col-span-2">Marks {totalMarks && <span className="normal-case font-normal">/ {totalMarks}</span>}</div>
                <div className="col-span-3">Remarks</div>
              </div>

              <div className="divide-y divide-gray-50">
                {students.map((student, i) => {
                  const val = marks[student.id]?.value ?? ""
                  const filled = val !== ""
                  const over = totalMarks && filled && Number(val) > Number(totalMarks)

                  return (
                    <div
                      key={student.id}
                      className={`grid grid-cols-12 items-center gap-3 px-6 py-3 transition-colors ${filled ? "bg-indigo-50/30" : "hover:bg-gray-50/50"}`}
                    >
                      {/* Index */}
                      <div className="col-span-1 text-xs font-bold text-gray-400">{i + 1}</div>

                      {/* Student */}
                      <div className="col-span-4 min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">{student.name}</p>
                        <p className="truncate text-[11px] text-gray-400">{student.email}</p>
                      </div>

                      {/* Roll */}
                      <div className="col-span-2">
                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                          {student.roll_number || "—"}
                        </span>
                      </div>

                      {/* Marks input */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          max={totalMarks ? Number(totalMarks) : undefined}
                          value={val}
                          onChange={(e) => setMark(student.id, e.target.value)}
                          placeholder="—"
                          className={`w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none transition-colors focus:ring-2 ${
                            over
                              ? "border-red-300 bg-red-50 text-red-700 focus:border-red-400 focus:ring-red-100"
                              : filled
                              ? "border-indigo-300 bg-indigo-50 text-indigo-800 focus:border-indigo-400 focus:ring-indigo-100"
                              : "border-gray-200 bg-white text-gray-700 focus:border-indigo-300 focus:ring-indigo-100"
                          }`}
                        />
                      </div>

                      {/* Remarks */}
                      <div className="col-span-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={marks[student.id]?.remarks ?? ""}
                          onChange={(e) => setRemarks(student.id, e.target.value)}
                          placeholder="Optional…"
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                        {filled && !over && (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar */}
              {students.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                        style={{ width: `${(filledCount / students.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 tabular-nums">
                      {filledCount}/{students.length}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="size-4" /> {success}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !courseId || students.length === 0}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? (
          <><Loader2 className="size-4 animate-spin" /> Saving…</>
        ) : (
          <><Save className="size-4" /> Save Exam & Marks</>
        )}
      </button>
    </div>
  )
}
