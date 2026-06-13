import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lessonId = new URL(request.url).searchParams.get("lessonId")
  if (lessonId) {
    const bookmark = await db.lessonBookmark.findUnique({
      where: { student_id_lesson_id: { student_id: session.user.id, lesson_id: lessonId } },
    })
    return NextResponse.json({ bookmarked: !!bookmark })
  }

  const bookmarks = await db.lessonBookmark.findMany({
    where: { student_id: session.user.id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return NextResponse.json({ bookmarks })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId } = (await request.json()) as { lessonId: string }
  if (!lessonId) return NextResponse.json({ error: "lessonId is required." }, { status: 400 })

  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { course_id: true } })
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 })

  const enrolled = await db.enrollment.findUnique({
    where: { student_id_course_id: { student_id: session.user.id, course_id: lesson.course_id } },
    select: { id: true },
  })
  if (!enrolled) return NextResponse.json({ error: "Not enrolled." }, { status: 403 })

  await db.lessonBookmark.upsert({
    where: { student_id_lesson_id: { student_id: session.user.id, lesson_id: lessonId } },
    update: {},
    create: { student_id: session.user.id, lesson_id: lessonId },
  })

  return NextResponse.json({ bookmarked: true })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lessonId = new URL(request.url).searchParams.get("lessonId")
  if (!lessonId) return NextResponse.json({ error: "lessonId is required." }, { status: 400 })

  await db.lessonBookmark.deleteMany({
    where: { student_id: session.user.id, lesson_id: lessonId },
  })

  return NextResponse.json({ bookmarked: false })
}
