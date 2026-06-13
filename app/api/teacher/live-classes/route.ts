import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type CreateBody = {
  courseId?: string
  title?: string
  description?: string
  meet_link?: string
  scheduled_at?: string
  join_window_minutes?: number
  duration?: number
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const classes = await db.liveClass.findMany({
    where: { teacher_id: session.user.id },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { scheduled_at: "asc" },
  })

  return NextResponse.json({ classes })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateBody
  const { courseId, title, description, meet_link, scheduled_at, join_window_minutes, duration } = body

  if (!courseId || !title?.trim() || !meet_link?.trim() || !scheduled_at) {
    return NextResponse.json({ error: "courseId, title, meet_link and scheduled_at are required." }, { status: 400 })
  }

  const course = await db.course.findFirst({
    where: { id: courseId, instructor_id: session.user.id },
    select: { id: true, title: true },
  })
  if (!course) {
    return NextResponse.json({ error: "Course not found or access denied." }, { status: 404 })
  }

  const windowMinutes = join_window_minutes && join_window_minutes > 0 ? Number(join_window_minutes) : 30

  const liveClass = await db.liveClass.create({
    data: {
      course_id: courseId,
      teacher_id: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      meet_link: meet_link.trim(),
      scheduled_at: new Date(scheduled_at),
      join_window_minutes: windowMinutes,
      duration: duration ? Number(duration) : null,
    },
    include: { course: { select: { id: true, title: true } } },
  })

  // Notify enrolled students
  const enrollments = await db.enrollment.findMany({
    where: { course_id: courseId },
    select: { student_id: true },
  })

  if (enrollments.length > 0) {
    const startTime = new Date(scheduled_at).toLocaleString("en-BD", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    await db.notification.createMany({
      data: enrollments.map((e) => ({
        recipient_id: e.student_id,
        type: "alert",
        message: `Live class scheduled: "${liveClass.title}" for ${course.title} — starts ${startTime}. Join window: ${windowMinutes} min.`,
        link: `/student/courses/${courseId}`,
        is_read: false,
      })),
    })
  }

  return NextResponse.json({ liveClass }, { status: 201 })
}
