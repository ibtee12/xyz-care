import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = {
  params: Promise<{ examId: string }>
}

type UpdateBody = {
  markId?: string
  marks_obtained?: number
  remarks?: string
}

export async function GET(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
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

  const marks = await db.studentMark.findMany({
    where: { exam_id: examId },
    select: {
      id: true,
      roll_number: true,
      marks_obtained: true,
      remarks: true,
      student: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { roll_number: "asc" },
  })

  return NextResponse.json({ exam, marks })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { examId } = await params
  const body = (await request.json()) as UpdateBody

  if (!body.markId || typeof body.marks_obtained !== "number") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const existing = await db.studentMark.findFirst({
    where: { id: body.markId, exam_id: examId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Mark row not found." }, { status: 404 })
  }

  const updated = await db.studentMark.update({
    where: { id: body.markId },
    data: {
      marks_obtained: body.marks_obtained,
      remarks: body.remarks?.trim() || null,
    },
    select: {
      id: true,
      marks_obtained: true,
      remarks: true,
    },
  })

  return NextResponse.json({ mark: updated })
}
