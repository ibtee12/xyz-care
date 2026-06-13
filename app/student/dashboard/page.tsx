import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { BookOpen, BarChart3, Calendar, TrendingUp, ChevronRight } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-md`}>
      <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-white/10" />
      <Icon className="mb-3 size-7 opacity-80" />
      <p className="text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-semibold opacity-80">{label}</p>
      {sub ? <p className="mt-0.5 text-xs opacity-60">{sub}</p> : null}
    </div>
  )
}

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    redirect("/login")
  }

  const [enrollments, upcomingExams, recentMarks] = await Promise.all([
    db.enrollment.findMany({
      where: { student_id: session.user.id },
      include: { course: { select: { id: true, title: true, slug: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    db.exam.findMany({
      where: { exam_date: { gte: new Date() } },
      select: { id: true, title: true, subject: true, exam_date: true, total_marks: true },
      orderBy: { exam_date: "asc" },
      take: 5,
    }),
    db.studentMark.findMany({
      where: { student_id: session.user.id },
      include: { exam: { select: { title: true, total_marks: true, subject: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
  ])

  const avgMark =
    recentMarks.length > 0
      ? Math.round(recentMarks.reduce((s, m) => s + m.marks_obtained, 0) / recentMarks.length)
      : null

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-md">
        <p className="text-sm font-medium text-indigo-200">Welcome back 👋</p>
        <h1 className="mt-1 text-2xl font-extrabold">{session.user.name}</h1>
        {session.user.roll_number ? (
          <p className="mt-1 text-xs text-indigo-200">Roll: {session.user.roll_number}</p>
        ) : null}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Enrolled Courses"
          value={enrollments.length}
          icon={BookOpen}
          gradient="from-indigo-500 to-violet-600"
        />
        <StatCard
          label="Avg Mark"
          value={avgMark !== null ? `${avgMark}` : "—"}
          sub="across recent exams"
          icon={BarChart3}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Upcoming Exams"
          value={upcomingExams.length}
          icon={Calendar}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Courses progress */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-800">Enrolled Courses</h2>
          <Link href="/student/courses" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
            View all <ChevronRight className="size-3" />
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No courses enrolled yet.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((e) => (
              <div key={e.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">{e.course.title}</p>
                  <p className="text-xs font-bold text-indigo-600">{e.progress}%</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-indigo-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, e.progress))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming exams */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="size-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-gray-800">Upcoming Exams</h2>
          </div>
          {upcomingExams.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No upcoming exams.</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="font-semibold text-amber-900 text-sm">{exam.title}</p>
                  <p className="text-xs text-amber-600">{exam.subject}</p>
                  <p className="mt-1 text-xs text-amber-500">
                    {new Date(exam.exam_date).toLocaleDateString()} · Total {exam.total_marks}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent marks */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-500" />
            <h2 className="text-lg font-extrabold text-gray-800">Recent Marks</h2>
          </div>
          {recentMarks.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No marks yet.</p>
          ) : (
            <div className="space-y-3">
              {recentMarks.map((m) => {
                const pct = Math.round((m.marks_obtained / m.exam.total_marks) * 100)
                const passing = pct >= 50
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.exam.title}</p>
                      <p className="text-xs text-gray-400">{m.exam.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        {m.marks_obtained}/{m.exam.total_marks}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${passing ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {passing ? "Pass" : "Fail"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
