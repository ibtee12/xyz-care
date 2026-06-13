import Link from "next/link"
import { FileText, Plus, Users, TrendingUp } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { db } from "@/lib/db"

const SUBJECT_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
]

export default async function AdminMarksPage() {
  const [exams, examStats] = await Promise.all([
    db.exam.findMany({
      select: { id: true, title: true, subject: true, exam_date: true, total_marks: true },
      orderBy: { exam_date: "desc" },
    }),
    db.studentMark.groupBy({
      by: ["exam_id"],
      _count: { _all: true },
      _avg: { marks_obtained: true },
    }),
  ])

  const statsMap = new Map(
    examStats.map((item) => [item.exam_id, { count: item._count._all, avg: item._avg.marks_obtained }])
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Marks Management</h1>
          <p className="mt-1 text-sm text-gray-500">Review exam mark sheets and performance.</p>
        </div>
        <Link
          href="/admin/marks/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="size-4" />
          Create Exam & Upload
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={FileText} title="No exams yet" description="Create your first exam and upload marks using the button above." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam, idx) => {
            const stats = statsMap.get(exam.id)
            const avgPct = stats?.avg ? Math.round((stats.avg / exam.total_marks) * 100) : null
            return (
              <Link
                key={exam.id}
                href={`/admin/marks/${exam.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${SUBJECT_COLORS[idx % SUBJECT_COLORS.length]}`}>
                      {exam.subject}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(exam.exam_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 line-clamp-2">{exam.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">Total: {exam.total_marks} marks</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-indigo-400" />
                      {stats?.count ?? 0} students
                    </span>
                    {avgPct !== null ? (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="size-3.5 text-emerald-400" />
                        Avg {avgPct}%
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
