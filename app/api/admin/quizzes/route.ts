import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type CreateBody = {
  course_id?: string
  title?: string
  description?: string
  time_limit?: number
  questions?: Array<{
    question: string
    options: string[]
    correct_index: number
    marks: number
  }>
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const quizzes = await db.quiz.findMany({
    include: {
      course: { select: { title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { created_at: "desc" },
  })

  return NextResponse.json({ quizzes })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateBody
  if (!body.course_id || !body.title?.trim() || !body.questions?.length) {
    return NextResponse.json({ error: "course_id, title and at least one question are required." }, { status: 400 })
  }

  const totalMarks = body.questions.reduce((s, q) => s + (q.marks ?? 1), 0)

  const quiz = await db.quiz.create({
    data: {
      course_id: body.course_id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      total_questions: body.questions.length,
      total_marks: totalMarks,
      time_limit: body.time_limit ?? null,
      is_published: true,
      questions: {
        create: body.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correct_index: q.correct_index,
          marks: q.marks ?? 1,
          order: i,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json({ quiz }, { status: 201 })
}
