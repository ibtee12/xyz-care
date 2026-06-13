import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { teacherOwnsCourse } from "@/lib/teacher-scope"

type CreateLessonBody = {
  course_id: string
  title: string
  description?: string | null
  video_url?: string | null
  duration?: number | null
  order?: number
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get("courseId")

  if (!courseId) {
    return NextResponse.json({ error: "courseId parameter is required." }, { status: 400 })
  }

  const lessons = await db.lesson.findMany({
    where: { course_id: courseId },
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ lessons })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateLessonBody
  const courseId = body.course_id?.trim()
  const title = body.title?.trim()

  if (!courseId || !title) {
    return NextResponse.json({ error: "course_id and title are required." }, { status: 400 })
  }

  const owns = await teacherOwnsCourse(session.user.id, courseId)
  if (!owns) {
    return NextResponse.json({ error: "Course not found or access denied." }, { status: 404 })
  }

  // Determine order if not explicitly provided
  let order = body.order
  if (order === undefined || order === null) {
    const agg = await db.lesson.aggregate({
      where: { course_id: courseId },
      _max: { order: true },
    })
    order = (agg._max.order ?? -1) + 1
  }

  const rawDuration = body.duration === undefined || body.duration === null ? null : Number(body.duration)
  const duration = rawDuration === null || Number.isNaN(rawDuration) || rawDuration < 0 ? null : rawDuration
  const videoUrl = body.video_url?.trim() || null

  const lesson = await db.lesson.create({
    data: {
      course_id: courseId,
      title,
      description: body.description?.trim() || null,
      video_url: videoUrl,
      duration,
      order,
    },
    include: {
      course: {
        select: { title: true },
      },
    },
  })

  // Trigger notification if video_url is provided
  if (videoUrl) {
    const enrollments = await db.enrollment.findMany({
      where: { course_id: courseId },
      select: {
        student: { select: { id: true, email: true } },
      },
    })

    if (enrollments.length > 0) {
      const message = `New recorded class uploaded for ${lesson.course.title}: ${lesson.title}`
      
      // In-app notification broadcast
      await db.notification.createMany({
        data: enrollments.map((en) => ({
          recipient_id: en.student.id,
          type: "alert",
          message,
          link: `/student/courses/${courseId}/lesson/${lesson.id}`,
          is_read: false,
        })),
      })

      // Optional email broadcast
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
              subject: `New Recorded Class: ${lesson.title}`,
              text: message,
            })
          }
        } catch {
          // Silent non-blocking catch
        }
      }
    }
  }

  return NextResponse.json({ lesson }, { status: 201 })
}
