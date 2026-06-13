import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ lessonId: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId } = await params
  const { is_completed } = await request.json()

  // Verify lesson exists and get its course
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { course_id: true },
  })
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  // Verify the student is enrolled in this course before touching any progress data
  const enrollment = await db.enrollment.findUnique({
    where: {
      student_id_course_id: {
        student_id: session.user.id,
        course_id: lesson.course_id,
      },
    },
    select: { id: true },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  // 1. Update or create lesson progress
  await db.lessonProgress.upsert({
    where: {
      student_id_lesson_id: {
        student_id: session.user.id,
        lesson_id: lessonId,
      },
    },
    update: { is_completed },
    create: {
      student_id: session.user.id,
      lesson_id: lessonId,
      is_completed,
    },
  })

  // 2. Calculate total progress for the course
  const courseId = lesson.course_id
  const totalLessons = await db.lesson.count({ where: { course_id: courseId } })
  const completedLessons = await db.lessonProgress.count({
    where: {
      student_id: session.user.id,
      lesson: { course_id: courseId },
      is_completed: true,
    },
  })

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // 3. Update enrollment progress (safe — enrollment verified above)
  await db.enrollment.update({
    where: {
      student_id_course_id: {
        student_id: session.user.id,
        course_id: courseId,
      },
    },
    data: { progress: progressPercentage },
  })

  return NextResponse.json({ success: true, progress: progressPercentage })
}
