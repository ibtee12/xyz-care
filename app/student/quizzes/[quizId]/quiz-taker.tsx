"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, CheckCircle2, XCircle, Clock, Trophy, Brain } from "lucide-react"

type Question = { id: string; question: string; options: string[]; marks: number; order: number }
type Quiz = { id: string; title: string; description: string | null; total_marks: number; total_questions: number; time_limit: number | null; course: { id: string; title: string }; questions: Question[] }
type Attempt = { score: number; answers: number[]; submitted_at: string }

export function QuizTaker({
  quiz,
  attempt: initialAttempt,
  correctAnswers,
}: {
  quiz: Quiz
  attempt: Attempt | null
  correctAnswers: number[] | null
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [attempt, setAttempt] = useState(initialAttempt)
  const [correct, setCorrect] = useState(correctAnswers)
  const [secondsLeft, setSecondsLeft] = useState(quiz.time_limit ? quiz.time_limit * 60 : null)
  const submitted = useRef(false)
  const answersRef = useRef(answers)
  const submitRef = useRef<() => Promise<void>>(async () => {})

  const submit = useCallback(async () => {
    if (submitted.current) return
    submitted.current = true
    setSubmitting(true)
    const currentAnswers = answersRef.current.map((a) => a ?? -1)
    const res = await fetch(`/api/student/quizzes/${quiz.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: currentAnswers }),
    })
    const data = await res.json()
    if (res.ok) {
      setAttempt({ score: data.score, answers: currentAnswers, submitted_at: new Date().toISOString() })
      setCorrect(null)
      // Fetch correct answers for review
      const qRes = await fetch(`/api/student/quizzes/${quiz.id}`)
      const qData = await qRes.json()
      if (qData.attempt) setCorrect(null) // will be served on reload
    }
    setSubmitting(false)
  }, [quiz.id])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    submitRef.current = submit
  }, [submit])

  useEffect(() => {
    if (!secondsLeft || attempt) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (!s || s <= 1) {
          clearInterval(id)
          if (!submitted.current) {
            void submitRef.current()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft, attempt])

  if (attempt) {
    const pct = Math.round((attempt.score / quiz.total_marks) * 100)
    const pass = pct >= 50
    return (
      <div className="space-y-6 max-w-2xl">
        <Link href={`/student/courses/${quiz.course.id}`} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
          <ArrowLeft className="size-4" /> Back to Course
        </Link>

        {/* Score card */}
        <div className={`rounded-3xl p-8 text-center ${pass ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-red-500 to-rose-600"} text-white shadow-lg`}>
          <div className="mb-4 flex justify-center">
            {pass ? <Trophy className="size-14 text-yellow-300" /> : <XCircle className="size-14 text-red-200" />}
          </div>
          <p className="text-5xl font-black tabular-nums">{attempt.score}<span className="text-2xl font-semibold opacity-70">/{quiz.total_marks}</span></p>
          <p className="mt-2 text-lg font-bold opacity-90">{pct}% — {pass ? "Passed!" : "Failed"}</p>
          <p className="mt-1 text-sm opacity-70">{quiz.title}</p>
        </div>

        {/* Answer review */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">Answer Review</h2>
          {quiz.questions.map((q, i) => {
            const selected = attempt.answers[i]
            const isCorrect = correct ? selected === correct[i] : null
            return (
              <div key={q.id} className={`rounded-2xl p-5 ${isCorrect === null ? "bg-white shadow-sm ring-1 ring-gray-100" : isCorrect ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-red-50 ring-1 ring-red-200"}`}>
                <div className="flex items-start gap-2">
                  {isCorrect !== null && (
                    isCorrect ? <CheckCircle2 className="size-5 shrink-0 text-emerald-500 mt-0.5" /> : <XCircle className="size-5 shrink-0 text-red-500 mt-0.5" />
                  )}
                  <p className="text-sm font-bold text-gray-800">Q{i + 1}. {q.question}</p>
                </div>
                <div className="mt-3 space-y-1.5 pl-7">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected === oi
                    const isRight = correct ? correct[i] === oi : false
                    return (
                      <div key={oi} className={`rounded-xl px-3 py-2 text-sm font-medium ${isRight && correct ? "bg-emerald-100 text-emerald-800" : isSelected && !isRight ? "bg-red-100 text-red-800" : "bg-white/60 text-gray-600"}`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                        {isSelected && <span className="ml-2 text-xs">(your answer)</span>}
                        {isRight && correct && <span className="ml-2 text-xs font-bold text-emerald-700">✓ correct</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const answered = answers.filter((a) => a !== null).length

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href={`/student/courses/${quiz.course.id}`} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="size-4" /> Back to Course
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="size-5 text-indigo-200" />
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{quiz.course.title}</span>
          </div>
          <h1 className="text-xl font-extrabold">{quiz.title}</h1>
          {quiz.description && <p className="mt-1 text-sm text-indigo-200">{quiz.description}</p>}
          <p className="mt-2 text-xs text-indigo-200">{quiz.total_questions} Questions · {quiz.total_marks} Marks</p>
        </div>
        {secondsLeft !== null && (
          <div className="flex shrink-0 flex-col items-center rounded-xl bg-white/20 px-4 py-2 text-center">
            <Clock className="size-4 text-indigo-200 mb-1" />
            <p className="text-xl font-black tabular-nums">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</p>
            <p className="text-[10px] text-indigo-200">remaining</p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <span>{answered}/{quiz.questions.length} answered</span>
        <div className="w-48 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(answered / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm font-bold text-gray-800 mb-4">
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">{qi + 1}</span>
              {q.question}
              <span className="ml-2 text-xs font-medium text-gray-400">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((prev) => prev.map((a, i) => i === qi ? oi : a))}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    answers[qi] === oi
                      ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50"
                  }`}
                >
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${answers[qi] === oi ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={submitting || answered === 0}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {submitting ? "Submitting…" : `Submit Quiz (${answered}/${quiz.questions.length} answered)`}
      </button>
    </div>
  )
}
