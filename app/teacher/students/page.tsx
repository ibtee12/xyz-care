import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Users } from "lucide-react"

import { Avatar } from "@/components/shared/avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") redirect("/login")

  const enrollments = await db.enrollment.findMany({
    where: { course: { instructor_id: session.user.id } },
    orderBy: { created_at: "desc" },
    include: {
      student: { select: { id: true, name: true, email: true, roll_number: true } },
      course: { select: { title: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-500">
          Students enrolled in courses you teach — one row per enrollment.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={Users} title="No students yet" description="Students will appear here once they enroll in your courses." />
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-50 text-xs font-semibold uppercase tracking-wide text-teal-700">
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-left">Roll</th>
                  <th className="px-5 py-3 text-left">Course</th>
                  <th className="px-5 py-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enrollments.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.student.name} size="sm" />
                        <span className="font-semibold text-gray-800">{row.student.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-gray-500 sm:table-cell max-w-[12rem] truncate">
                      {row.student.email}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-gray-400">
                      {row.student.roll_number ?? "—"}
                    </td>
                    <td className="px-5 py-3 max-w-[10rem] truncate text-gray-600">{row.course.title}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs text-gray-500">{row.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
