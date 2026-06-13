import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Brain, Plus, Users, HelpCircle } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function AdminQuizzesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  const quizzes = await db.quiz.findMany({
    include: {
      course: { select: { title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quizzes</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage course quizzes.</p>
        </div>
        <Link href="/admin/quizzes/new" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
          <Plus className="size-4" /> New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <Brain className="mb-3 size-10 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">No quizzes yet. Create one to assess your students.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <div key={q.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">Quiz</span>
                {q.time_limit && <span className="text-xs font-medium text-gray-400">{q.time_limit} min</span>}
              </div>
              <h3 className="font-bold text-gray-800 truncate">{q.title}</h3>
              <p className="mt-0.5 text-xs text-gray-400 truncate">{q.course.title}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><HelpCircle className="size-3" />{q._count.questions} Questions</span>
                <span className="flex items-center gap-1"><Users className="size-3" />{q._count.attempts} Attempts</span>
              </div>
              <div className="mt-4 text-xs font-bold text-indigo-600">{q.total_marks} Total Marks</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
