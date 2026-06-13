import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Users, BookOpen, TrendingUp, CreditCard, Award, GraduationCap } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

function formatCurrency(n: number) {
  return "৳" + n.toLocaleString("en-US", { minimumFractionDigits: 0 })
}

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    recentPayments,
    topCourses,
    monthlyEnrollments,
    totalQuizAttempts,
    certCount,
  ] = await Promise.all([
    db.user.count({ where: { role: "student" } }),
    db.user.count({ where: { role: "teacher" } }),
    db.course.count(),
    db.enrollment.count(),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    db.payment.findMany({
      where: { status: "paid" },
      orderBy: { created_at: "desc" },
      take: 8,
      include: { student: { select: { name: true } } },
    }),
    db.course.findMany({
      orderBy: { enrollments: { _count: "desc" } },
      take: 6,
      include: { _count: { select: { enrollments: true } } },
    }),
    db.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM "Enrollment"
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `,
    db.quizAttempt.count(),
    db.certificate.count(),
  ])

  const revenue = Number(totalRevenue._sum.amount ?? 0)
  const maxEnrollment = Math.max(...topCourses.map((c) => c._count.enrollments), 1)
  const monthlyData = monthlyEnrollments as { month: string; count: bigint }[]
  const maxMonthly = Math.max(...monthlyData.map((m) => Number(m.count)), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {([
          { label: "Students", value: String(totalStudents), icon: Users, color: "from-indigo-500 to-violet-600" },
          { label: "Teachers", value: String(totalTeachers), icon: GraduationCap, color: "from-teal-500 to-cyan-600" },
          { label: "Courses", value: String(totalCourses), icon: BookOpen, color: "from-amber-500 to-orange-500" },
          { label: "Enrollments", value: String(totalEnrollments), icon: TrendingUp, color: "from-emerald-500 to-green-600", wide: true },
          { label: "Revenue", value: formatCurrency(revenue), icon: CreditCard, color: "from-pink-500 to-rose-600" },
          { label: "Certificates", value: String(certCount), icon: Award, color: "from-yellow-500 to-amber-500" },
        ] as const).map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-5 text-white shadow-md ${"wide" in card && card.wide ? "col-span-2 lg:col-span-1" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">{card.label}</p>
              <card.icon className="size-5 opacity-60" />
            </div>
            <p className="text-3xl font-black tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Enrollments Bar Chart */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">Enrollments — Last 6 Months</h2>
          {monthlyData.length === 0 ? (
            <p className="text-center text-xs text-gray-300 py-8">No data yet</p>
          ) : (
            <div className="flex items-end gap-3 h-36">
              {monthlyData.map((m) => {
                const pct = Math.max((Number(m.count) / maxMonthly) * 100, 4)
                const label = m.month.slice(5)
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-indigo-600">{Number(m.count)}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500" style={{ height: `${pct}%` }} />
                    <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">Top Courses by Enrollment</h2>
          <div className="space-y-3">
            {topCourses.map((c, i) => {
              const pct = Math.max((c._count.enrollments / maxEnrollment) * 100, 4)
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-700 truncate max-w-[70%]">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-black text-indigo-700">{i + 1}</span>
                      {c.title}
                    </span>
                    <span className="font-bold text-gray-500">{c._count.enrollments}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {topCourses.length === 0 && <p className="text-xs text-gray-300 text-center py-4">No courses yet</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">Recent Payments</h2>
          {recentPayments.length === 0 ? (
            <p className="text-center text-xs text-gray-300 py-4">No payments yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.student.name}</p>
                    <p className="text-xs text-gray-400">{p.method} · {p.txn_id.slice(0, 12)}…</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(Number(p.amount))}</p>
                    <p className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz + Cert Summary */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">Activity Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
              <p className="text-sm font-semibold text-indigo-800">Quiz Attempts</p>
              <p className="text-2xl font-black text-indigo-700">{totalQuizAttempts}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">Certificates Issued</p>
              <p className="text-2xl font-black text-amber-700">{certCount}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-800">Total Revenue</p>
              <p className="text-xl font-black text-emerald-700">{formatCurrency(revenue)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
