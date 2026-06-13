import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { BarChart3 } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import { MarksTable } from "./marks-table"

export default async function StudentMarksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    redirect("/login")
  }

  const exams = await db.exam.findMany({
    select: { id: true, title: true, subject: true, exam_date: true, total_marks: true },
    orderBy: { exam_date: "desc" },
  })

  const rows = await Promise.all(
    exams.map(async (exam) => {
      const [ownMark, highestMark] = await Promise.all([
        db.studentMark.findFirst({
          where: { exam_id: exam.id, student_id: session.user.id },
          select: { marks_obtained: true },
        }),
        db.studentMark.aggregate({
          where: { exam_id: exam.id },
          _max: { marks_obtained: true },
        }),
      ])
      return {
        examId: exam.id,
        examName: exam.title,
        subject: exam.subject,
        date: new Date(exam.exam_date).toLocaleDateString(),
        yourMark: ownMark?.marks_obtained ?? null,
        highestMark: highestMark._max.marks_obtained ?? null,
        totalMarks: exam.total_marks,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Marks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your scores compared with the class highest in each exam.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={BarChart3} title="No exams yet" description="Your exam results will appear here once marks are uploaded." />
        </div>
      ) : (
        <MarksTable rows={rows} />
      )}
    </div>
  )
}
