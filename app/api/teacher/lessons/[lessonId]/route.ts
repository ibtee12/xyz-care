import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ lessonId: string }> }

type UpdateLessonBody = {
  title?: string
  description?: string | null
  video_url?: string | null
  duration?: number | null
  order?: number
}

async function lessonForTeacher(lessonId: string, teacherId: string) {
  return db.lesson.findFirst({
    where: {
      id: lessonId,
      course: { instructor_id: teacherId },
    },
    select: { id: true, course_id: true },
  })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId } = await params
  const existing = await lessonForTeacher(lessonId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }

  const body = (await request.json()) as UpdateLessonBody
  const data: {
    title?: string
    description?: string | null
    video_url?: string | null
    duration?: number | null
    order?: number
  } = {}

  if (body.title !== undefined) {
    const t = body.title.trim()
    if (!t) {
      return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 })
    }
    data.title = t
  }
  if (body.description !== undefined) {
    data.description = body.description === null ? null : body.description.trim() || null
  }
  if (body.video_url !== undefined) {
    data.video_url = body.video_url === null ? null : String(body.video_url).trim() || null
  }
  if (body.duration !== undefined) {
    if (body.duration === null) {
      data.duration = null
    } else {
      const d = Number(body.duration)
      data.duration = Number.isNaN(d) || d < 0 ? null : d
    }
  }
  if (body.order !== undefined) {
    data.order = Number(body.order)
  }

  const lesson = await db.lesson.update({
    where: { id: lessonId },
    data,
  })

  return NextResponse.json({ lesson })
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId } = await params
  const existing = await lessonForTeacher(lessonId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }

  await db.lesson.delete({ where: { id: lessonId } })
  return NextResponse.json({ success: true })
}
