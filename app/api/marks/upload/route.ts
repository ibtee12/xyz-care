import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type MarkEntry = {
  student_id: string
  roll_number: string
  marks_obtained: number
  remarks?: string
}

type UploadBody = {
  exam?: {
    title?: string
    subject?: string
    total_marks?: number
    exam_date?: string
  }
  marks?: MarkEntry[]
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as UploadBody
  const exam = body.exam
  const marks = (body.marks ?? []).filter(
    (m) => m.student_id && Number.isFinite(m.marks_obtained)
  )

  if (!exam?.title || !exam.subject || !exam.total_marks || !exam.exam_date) {
    return NextResponse.json({ error: "All exam fields are required." }, { status: 400 })
  }

  if (marks.length === 0) {
    return NextResponse.json({ error: "No marks to save." }, { status: 422 })
  }

  const createdExam = await db.exam.create({
    data: {
      title: exam.title.trim(),
      subject: exam.subject.trim(),
      total_marks: Number(exam.total_marks),
      exam_date: new Date(exam.exam_date),
      created_by: session.user.id,
    },
    select: { id: true },
  })

  const inserted = await db.studentMark.createMany({
    data: marks.map((m) => ({
      exam_id: createdExam.id,
      student_id: m.student_id,
      roll_number: m.roll_number,
      marks_obtained: Number(m.marks_obtained),
      remarks: m.remarks?.trim() || null,
    })),
    skipDuplicates: true,
  })

  return NextResponse.json({ examId: createdExam.id, insertedCount: inserted.count })
}
