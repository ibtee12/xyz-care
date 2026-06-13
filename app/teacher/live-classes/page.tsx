import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { TeacherLiveClassesClient } from "./live-classes-client"

export default async function TeacherLiveClassesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") redirect("/login")

  const [classes, courses] = await Promise.all([
    db.liveClass.findMany({
      where: { teacher_id: session.user.id },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { scheduled_at: "asc" },
    }),
    db.course.findMany({
      where: { instructor_id: session.user.id, course_type: "online" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ])

  return (
    <TeacherLiveClassesClient
      classes={classes.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        meet_link: c.meet_link,
        scheduled_at: c.scheduled_at.toISOString(),
        join_window_minutes: c.join_window_minutes,
        duration: c.duration,
        course: c.course,
      }))}
      courses={courses}
    />
  )
}
