import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { BarChart3 } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function TeacherMarksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") redirect("/login")

  const teacherId = session.user.id

  const myCourses = await db.course.findMany({
    where: { instructor_id: teacherId },
    select: { id: true },
  })
  const courseIds = myCourses.map((c) => c.id)

  const studentIds =
    courseIds.length === 0
      ? []
      : [
          ...new Set(
            (
              await db.enrollment.findMany({
                where: { course_id: { in: courseIds } },
                select: { student_id: true },
              })
            ).map((e) => e.student_id)
          ),
        ]

  const marks =
    studentIds.length === 0
      ? []
      : await db.studentMark.findMany({
          where: { student_id: { in: studentIds } },
          orderBy: { created_at: "desc" },
          take: 150,
          include: {
            exam: { select: { title: true, subject: true, total_marks: true, exam_date: true } },
            student: { select: { name: true, roll_number: true } },
          },
        })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Marks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Exam marks for students enrolled in your courses.
        </p>
      </div>

      {marks.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={BarChart3} title="No marks yet" description="Marks will appear here once students are enrolled and exam results are uploaded." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-50 text-xs font-semibold uppercase tracking-wide text-teal-700">
                  <th className="px-5 py-3 text-left">Exam</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Subject</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Roll</th>
                  <th className="px-5 py-3 text-right">Score</th>
                  <th className="px-5 py-3 text-right hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {marks.map((m, idx) => {
                  const pct = Math.round((m.marks_obtained / m.exam.total_marks) * 100)
                  const passing = pct >= 50
                  return (
                    <tr key={m.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                      <td className="px-5 py-3 font-medium text-gray-800 max-w-[10rem] truncate">{m.exam.title}</td>
                      <td className="hidden px-5 py-3 text-gray-500 md:table-cell">{m.exam.subject}</td>
                      <td className="px-5 py-3 text-gray-700">{m.student.name}</td>
                      <td className="hidden px-5 py-3 tabular-nums text-gray-400 sm:table-cell">
                        {m.student.roll_number ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex flex-col items-end gap-0.5">
                          <span className="tabular-nums font-semibold text-gray-800">
                            {m.marks_obtained}/{m.exam.total_marks}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${passing ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-right text-xs text-gray-400 lg:table-cell">
                        {new Date(m.exam.exam_date).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
