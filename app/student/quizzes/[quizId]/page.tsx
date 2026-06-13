import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { QuizTaker } from "./quiz-taker"

type PageProps = { params: Promise<{ quizId: string }> }

export default async function StudentQuizPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const { quizId } = await params
  const quiz = await db.quiz.findUnique({
    where: { id: quizId, is_published: true },
    include: {
      questions: { orderBy: { order: "asc" } },
      course: { select: { id: true, title: true } },
    },
  })
  if (!quiz) notFound()

  const enrolled = await db.enrollment.findUnique({
    where: { student_id_course_id: { student_id: session.user.id, course_id: quiz.course_id } },
    select: { id: true },
  })
  if (!enrolled) redirect(`/student/courses`)

  const attempt = await db.quizAttempt.findUnique({
    where: { quiz_id_student_id: { quiz_id: quizId, student_id: session.user.id } },
  })

  const safeQuestions = quiz.questions.map(({ id, question, options, marks, order }) => ({ id, question, options, marks, order }))
  const correctAnswers = quiz.questions.map((q) => q.correct_index)

  return (
    <QuizTaker
      quiz={{ ...quiz, questions: safeQuestions }}
      attempt={attempt ? { score: attempt.score, answers: attempt.answers, submitted_at: attempt.submitted_at.toISOString() } : null}
      correctAnswers={attempt ? correctAnswers : null}
    />
  )
}
