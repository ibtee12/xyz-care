"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2 } from "lucide-react"

type Course = { id: string; title: string }
type Question = { question: string; options: string[]; correct_index: number; marks: number }

const blankQuestion = (): Question => ({
  question: "",
  options: ["", "", "", ""],
  correct_index: 0,
  marks: 1,
})

export function QuizBuilder({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [courseId, setCourseId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimit, setTimeLimit] = useState("")
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const updateQ = (i: number, patch: Partial<Question>) =>
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))

  const updateOption = (qi: number, oi: number, val: string) =>
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q))
    )

  const save = async () => {
    if (!courseId || !title.trim()) { setError("Course and title are required."); return }
    for (const q of questions) {
      if (!q.question.trim()) { setError("All questions must have text."); return }
      if (q.options.some((o) => !o.trim())) { setError("All options must be filled in."); return }
    }
    setSaving(true); setError("")
    const res = await fetch("/api/admin/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId, title, description, time_limit: timeLimit ? Number(timeLimit) : undefined, questions }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Failed."); setSaving(false); return }
    router.push("/admin/quizzes")
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/quizzes" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft className="size-4" /> Back to Quizzes
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Create Quiz</h1>
      </div>

      {/* Quiz details */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-800">Quiz Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              <option value="">Select course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 3 Quiz" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time Limit (minutes, optional)</label>
            <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="30" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Questions ({questions.length})</h2>
          <button onClick={() => setQuestions((prev) => [...prev, blankQuestion()])} className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100">
            <Plus className="size-4" /> Add Question
          </button>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-indigo-600">Q{qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))} className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQ(qi, { question: e.target.value })}
              placeholder="Question text…"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            />
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${q.correct_index === oi ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}>
                  <button
                    type="button"
                    onClick={() => updateQ(qi, { correct_index: oi })}
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${q.correct_index === oi ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}
                  >
                    {q.correct_index === oi && <CheckCircle2 className="size-3 text-white" />}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Marks:</label>
              <input type="number" min={1} value={q.marks} onChange={(e) => updateQ(qi, { marks: Number(e.target.value) })} className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">
        <Save className="size-4" /> {saving ? "Saving…" : "Create Quiz"}
      </button>
    </div>
  )
}
