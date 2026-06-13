import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { QuizBuilder } from "./quiz-builder"

export default async function AdminNewQuizPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  const courses = await db.course.findMany({
    where: { is_published: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })

  return <QuizBuilder courses={courses} />
}
