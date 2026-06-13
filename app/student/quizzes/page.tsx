import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { QuizzesList } from "./quizzes-list"

export default async function StudentQuizzesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const enrollments = await db.enrollment.findMany({
    where: { student_id: session.user.id },
    select: { course_id: true },
  })
  const courseIds = enrollments.map((e) => e.course_id)

  const quizzes = await db.quiz.findMany({
    where: { course_id: { in: courseIds }, is_published: true },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { created_at: "desc" },
  })

  const attempts = await db.quizAttempt.findMany({
    where: { student_id: session.user.id, quiz_id: { in: quizzes.map((q) => q.id) } },
    select: { quiz_id: true, score: true },
  })
  const attemptMap = new Map(attempts.map((a) => [a.quiz_id, a.score]))

  const data = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    total_marks: q.total_marks,
    time_limit: q.time_limit,
    course: q.course,
    question_count: q._count.questions,
    attempted: attemptMap.has(q.id),
    score: attemptMap.get(q.id) ?? null,
  }))

  return <QuizzesList quizzes={data} />
}
