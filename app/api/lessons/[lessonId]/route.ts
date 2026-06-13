import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { teacherOwnsCourse } from "@/lib/teacher-scope"

type RouteParams = {
  params: Promise<{ lessonId: string }>
}

type UpdateLessonBody = {
  title?: string
  description?: string | null
  video_url?: string | null
  duration?: number | null
  order?: number
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId } = await params
  const existingLesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: { select: { id: true, title: true } },
    },
  })

  if (!existingLesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }

  const owns = await teacherOwnsCourse(session.user.id, existingLesson.course.id)
  if (!owns) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 })
  }

  const body = (await request.json()) as UpdateLessonBody

  const rawDuration = body.duration === undefined || body.duration === null ? null : Number(body.duration)
  const duration = rawDuration === null || Number.isNaN(rawDuration) || rawDuration < 0 ? null : rawDuration

  const nextVideoUrl = body.video_url === undefined ? existingLesson.video_url : body.video_url?.trim() || null

  const updatedLesson = await db.lesson.update({
    where: { id: lessonId },
    data: {
      title: body.title?.trim() || existingLesson.title,
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      video_url: nextVideoUrl,
      ...(body.duration !== undefined ? { duration } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    },
    include: {
      course: { select: { title: true } },
    },
  })

  // If video_url transitioned from empty to populated, or teacher re-uploads/sets it, notify students
  const newlySetVideo = nextVideoUrl && nextVideoUrl !== existingLesson.video_url

  if (newlySetVideo) {
    const enrollments = await db.enrollment.findMany({
      where: { course_id: existingLesson.course.id },
      select: {
        student: { select: { id: true, email: true } },
      },
    })

    if (enrollments.length > 0) {
      const message = `New recorded class uploaded for ${updatedLesson.course.title}: ${updatedLesson.title}`
      
      await db.notification.createMany({
        data: enrollments.map((en) => ({
          recipient_id: en.student.id,
          type: "alert",
          message,
          link: `/student/courses/${existingLesson.course.id}/lesson/${lessonId}`,
          is_read: false,
        })),
      })

      const resendApiKey = process.env.RESEND_API_KEY
      const fromEmail = process.env.RESEND_FROM_EMAIL
      if (resendApiKey && fromEmail) {
        try {
          const { Resend } = await import("resend")
          const resend = new Resend(resendApiKey)
          for (const en of enrollments) {
            await resend.emails.send({
              from: fromEmail,
              to: en.student.email,
              subject: `New Recorded Class: ${updatedLesson.title}`,
              text: message,
            })
          }
        } catch {
          // Non-blocking catch
        }
      }
    }
  }

  return NextResponse.json({ lesson: updatedLesson })
}

export async function PUT(request: Request, params: RouteParams) {
  return PATCH(request, params)
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId } = await params
  const existingLesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { course_id: true },
  })

  if (!existingLesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }

  const owns = await teacherOwnsCourse(session.user.id, existingLesson.course_id)
  if (!owns) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 })
  }

  await db.lesson.delete({ where: { id: lessonId } })
  return NextResponse.json({ success: true })
}
