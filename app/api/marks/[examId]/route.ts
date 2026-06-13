import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = {
  params: Promise<{ examId: string }>
}

export async function GET(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { examId } = await params

  const exam = await db.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      title: true,
      subject: true,
      exam_date: true,
      total_marks: true,
    },
  })

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 })
  }

  const [ownMark, highestMark] = await Promise.all([
    db.studentMark.findFirst({
      where: {
        exam_id: examId,
        student_id: session.user.id,
      },
      select: {
        marks_obtained: true,
        remarks: true,
        created_at: true,
      },
    }),
    db.studentMark.aggregate({
      where: { exam_id: examId },
      _max: { marks_obtained: true },
    }),
  ])

  return NextResponse.json({
    exam,
    result: {
      your_mark: ownMark?.marks_obtained ?? null,
      highest_mark: highestMark._max.marks_obtained ?? null,
      remarks: ownMark?.remarks ?? null,
      published_at: ownMark?.created_at ?? null,
    },
  })
}
