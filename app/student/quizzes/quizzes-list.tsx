"use client"

import Link from "next/link"
import { Brain, Clock, CheckCircle2, BookOpen, Trophy } from "lucide-react"

type Quiz = {
  id: string
  title: string
  description: string | null
  total_marks: number
  time_limit: number | null
  course: { id: string; title: string }
  question_count: number
  attempted: boolean
  score: number | null
}

export function QuizzesList({ quizzes }: { quizzes: Quiz[] }) {
  if (quizzes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Quizzes</h1>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <Brain className="mb-3 size-10 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">No quizzes available yet.</p>
          <p className="mt-1 text-xs text-gray-300">Quizzes will appear here when your instructor creates them.</p>
        </div>
      </div>
    )
  }

  const pending = quizzes.filter((q) => !q.attempted)
  const completed = quizzes.filter((q) => q.attempted)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Quizzes</h1>
        <p className="mt-1 text-sm text-gray-500">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} across your courses</p>
      </div>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pending</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((q) => <QuizCard key={q.id} quiz={q} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Completed</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {completed.map((q) => <QuizCard key={q.id} quiz={q} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const pct = quiz.attempted && quiz.score !== null ? Math.round((quiz.score / quiz.total_marks) * 100) : null
  const pass = pct !== null && pct >= 50

  return (
    <div className={`relative rounded-2xl bg-white p-5 shadow-sm ring-1 ${quiz.attempted ? "ring-gray-100" : "ring-indigo-100"} overflow-hidden`}>
      {!quiz.attempted && (
        <div className="absolute top-0 right-0 size-20 -translate-y-6 translate-x-6 rounded-full bg-indigo-50 opacity-60" />
      )}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${quiz.attempted ? (pass ? "bg-emerald-100" : "bg-red-100") : "bg-indigo-100"}`}>
            {quiz.attempted
              ? (pass ? <Trophy className="size-4 text-emerald-600" /> : <Brain className="size-4 text-red-500" />)
              : <Brain className="size-4 text-indigo-600" />
            }
          </div>
          <div>
            {quiz.attempted && pct !== null && (
              <span className={`text-xs font-black ${pass ? "text-emerald-600" : "text-red-500"}`}>{pct}% — {pass ? "Passed" : "Failed"}</span>
            )}
            {!quiz.attempted && <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">New</span>}
          </div>
        </div>
        {quiz.attempted && <CheckCircle2 className="size-4 shrink-0 text-gray-300" />}
      </div>

      <h3 className="font-bold text-gray-800 leading-snug">{quiz.title}</h3>
      {quiz.description && <p className="mt-1 text-xs text-gray-400 line-clamp-2">{quiz.description}</p>}

      <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400 font-medium">
        <span className="flex items-center gap-1"><BookOpen className="size-3" />{quiz.course.title}</span>
        {quiz.time_limit && <span className="flex items-center gap-1"><Clock className="size-3" />{quiz.time_limit} min</span>}
        <span>{quiz.question_count} Q · {quiz.total_marks} marks</span>
      </div>

      {quiz.attempted ? (
        <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-center text-sm font-semibold text-gray-400">
          Score: {quiz.score}/{quiz.total_marks}
        </div>
      ) : (
        <Link
          href={`/student/quizzes/${quiz.id}`}
          className="mt-4 block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:opacity-90 transition-opacity"
        >
          Start Quiz
        </Link>
      )}
    </div>
  )
}
