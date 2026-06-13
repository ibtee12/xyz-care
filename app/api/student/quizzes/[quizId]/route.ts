import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ quizId: string }> }

export async function GET(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { quizId } = await params
  const quiz = await db.quiz.findUnique({
    where: { id: quizId, is_published: true },
    include: {
      questions: { orderBy: { order: "asc" } },
      course: { select: { id: true, title: true } },
    },
  })

  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 })

  const enrolled = await db.enrollment.findUnique({
    where: { student_id_course_id: { student_id: session.user.id, course_id: quiz.course_id } },
    select: { id: true },
  })
  if (!enrolled) return NextResponse.json({ error: "Not enrolled in this course." }, { status: 403 })

  const attempt = await db.quizAttempt.findUnique({
    where: { quiz_id_student_id: { quiz_id: quizId, student_id: session.user.id } },
  })

  // Return questions WITHOUT correct_index so students can't cheat
  const safeQuestions = quiz.questions.map(({ id, question, options, marks, order }) => ({ id, question, options, marks, order }))

  return NextResponse.json({
    quiz: { ...quiz, questions: safeQuestions },
    attempt: attempt ? { score: attempt.score, answers: attempt.answers, submitted_at: attempt.submitted_at } : null,
  })
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { quizId } = await params
  const { answers } = (await request.json()) as { answers: number[] }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId, is_published: true },
    include: { questions: { orderBy: { order: "asc" } } },
  })
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 })

  const enrolled = await db.enrollment.findUnique({
    where: { student_id_course_id: { student_id: session.user.id, course_id: quiz.course_id } },
    select: { id: true },
  })
  if (!enrolled) return NextResponse.json({ error: "Not enrolled." }, { status: 403 })

  const existing = await db.quizAttempt.findUnique({
    where: { quiz_id_student_id: { quiz_id: quizId, student_id: session.user.id } },
  })
  if (existing) return NextResponse.json({ error: "You have already submitted this quiz." }, { status: 409 })

  // Score the answers
  let score = 0
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correct_index) score += q.marks
  })

  const attempt = await db.quizAttempt.create({
    data: { quiz_id: quizId, student_id: session.user.id, answers, score },
  })

  return NextResponse.json({ score, total: quiz.total_marks, attempt }, { status: 201 })
}
