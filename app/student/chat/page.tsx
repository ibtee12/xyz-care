import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { StudentChatClient } from "./chat-client"

export default async function StudentChatPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const enrollments = await db.enrollment.findMany({
    where: { student_id: session.user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructor: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  const teacherMap = new Map<string, { id: string; name: string; email: string; courseTitle: string }>()
  for (const e of enrollments) {
    if (!teacherMap.has(e.course.instructor.id)) {
      teacherMap.set(e.course.instructor.id, {
        ...e.course.instructor,
        courseTitle: e.course.title,
      })
    }
  }

  return (
    <StudentChatClient
      studentId={session.user.id}
      studentName={session.user.name ?? "You"}
      teachers={Array.from(teacherMap.values())}
    />
  )
}
