import { Users, BookOpen, FileText, TrendingUp, CheckCircle2, Clock } from "lucide-react"

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

function paymentBadge(status: string) {
  const s = status.toLowerCase()
  if (["paid", "success", "completed", "valid"].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="size-3" /> {status}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      <Clock className="size-3" /> {status}
    </span>
  )
}

export default async function AdminDashboardPage() {
  const [totalStudents, publishedCourses, uploadedExams, payments] = await Promise.all([
    db.user.count({ where: { role: "student" } }),
    db.course.count({ where: { is_published: true } }),
    db.exam.count(),
    db.payment.findMany({
      include: { student: { select: { name: true, roll_number: true } } },
      orderBy: { created_at: "desc" },
      take: 8,
    }),
  ])

  const totalRevenue = payments
    .filter((p) => ["paid", "success", "completed"].includes(p.status.toLowerCase()))
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-800 p-6 text-white shadow-md">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
        <p className="mt-1 text-indigo-200 text-sm">Overview of platform activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={totalStudents} icon={Users} gradient="from-indigo-500 to-violet-600" />
        <StatCard
          label="Revenue"
          value={`৳${totalRevenue.toLocaleString("en-BD")}`}
          sub="from successful payments"
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard label="Exams" value={uploadedExams} icon={FileText} gradient="from-amber-500 to-orange-600" />
        <StatCard label="Courses Live" value={publishedCourses} icon={BookOpen} gradient="from-cyan-500 to-blue-600" />
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <TrendingUp className="size-5 text-indigo-500" />
          <h2 className="text-lg font-extrabold text-gray-800">Recent Payments</h2>
        </div>
        {payments.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Roll</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Method</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-5 py-3 font-medium text-gray-800">{p.student.name}</td>
                    <td className="hidden px-5 py-3 tabular-nums text-gray-400 sm:table-cell">
                      {p.student.roll_number ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-800">
                      ৳{Number(p.amount).toLocaleString("en-BD")}
                    </td>
                    <td className="hidden px-5 py-3 text-gray-500 md:table-cell">{p.method}</td>
                    <td className="px-5 py-3">{paymentBadge(p.status)}</td>
                    <td className="hidden px-5 py-3 text-right text-xs text-gray-400 lg:table-cell">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
