import { CheckCircle2, Clock, CreditCard } from "lucide-react"

import { db } from "@/lib/db"

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const ok = ["paid", "success", "completed", "valid"].includes(s)
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="size-3" /> {status}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
      <Clock className="size-3" /> {status}
    </span>
  )
}

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    include: { student: { select: { name: true, email: true, roll_number: true } } },
    orderBy: { created_at: "desc" },
  })

  const totalRevenue = payments
    .filter((p) => ["paid", "success", "completed"].includes(p.status.toLowerCase()))
    .reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">Complete payment ledger across all students.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-md">
          <CheckCircle2 className="mb-2 size-6 opacity-80" />
          <p className="text-2xl font-extrabold tabular-nums">৳{totalRevenue.toLocaleString("en-BD")}</p>
          <p className="mt-1 text-sm font-medium opacity-80">Total Revenue</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-md">
          <CreditCard className="mb-2 size-6 opacity-80" />
          <p className="text-2xl font-extrabold tabular-nums">{payments.length}</p>
          <p className="mt-1 text-sm font-medium opacity-80">Total Transactions</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <CreditCard className="size-5 text-indigo-500" />
          <h2 className="text-lg font-extrabold text-gray-800">All Transactions</h2>
        </div>
        {payments.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Roll</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Method</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">{p.student.name}</td>
                    <td className="hidden px-5 py-3 text-gray-500 sm:table-cell max-w-[12rem] truncate">{p.student.email}</td>
                    <td className="hidden px-5 py-3 tabular-nums text-gray-400 md:table-cell">{p.student.roll_number ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-800">
                      ৳{Number(p.amount).toLocaleString("en-BD")}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{p.method}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
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
