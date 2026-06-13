import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type UpdateCourseBody = {
  title?: string
  slug?: string
  description?: string
  price?: number
  thumbnail?: string
  instructor_id?: string
  is_published?: boolean
  course_type?: "online" | "offline"
  location?: string | null
  schedule?: string | null
  time?: string | null
  batch?: string | null
}

type RouteParams = {
  params: Promise<{ courseId: string }>
}

export async function GET(_: Request, { params }: RouteParams) {
  const { courseId } = await params

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  return NextResponse.json({ course })
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params
  const body = (await request.json()) as UpdateCourseBody

  const existingCourse = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructor_id: true, course_type: true },
  })
  if (!existingCourse) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  const nextSlug = body.slug?.trim()
  if (nextSlug) {
    const slugConflict = await db.course.findFirst({
      where: {
        slug: nextSlug,
        NOT: { id: courseId },
      },
      select: { id: true },
    })
    if (slugConflict) {
      return NextResponse.json({ error: "Slug already exists." }, { status: 409 })
    }
  }

  const nextCourseType = body.course_type === "offline" ? "offline" : body.course_type === "online" ? "online" : undefined

  const updated = await db.course.update({
    where: { id: courseId },
    data: {
      title: body.title?.trim(),
      slug: nextSlug,
      description:
        body.description === undefined ? undefined : body.description.trim() || null,
      price: body.price === undefined ? undefined : Number(body.price),
      thumbnail:
        body.thumbnail === undefined ? undefined : body.thumbnail.trim() || null,
      instructor_id: body.instructor_id?.trim(),
      is_published: body.is_published,
      ...(nextCourseType ? { course_type: nextCourseType } : {}),
      ...(body.course_type !== undefined ? {
        location: body.course_type === "offline" ? body.location?.trim() || null : null,
        batch: body.course_type === "offline" ? body.batch?.trim() || null : null,
      } : {}),
      ...(body.schedule !== undefined ? { schedule: body.schedule?.trim() || null } : {}),
      ...(body.time !== undefined ? { time: body.time?.trim() || null } : {}),
    },
    include: {
      instructor: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  // If ONLINE course and instructor changed to a new instructor, notify them
  const isOnline = updated.course_type === "online"
  const instructorChanged = body.instructor_id && body.instructor_id.trim() !== existingCourse.instructor_id

  if (isOnline && instructorChanged && updated.instructor) {
    const message = `You have been assigned to upload recorded classes for ${updated.title}. Please log in and start uploading your lessons.`
    
    await db.notification.create({
      data: {
        recipient_id: updated.instructor.id,
        type: "alert",
        message,
        link: `/teacher/courses/${updated.id}`,
        is_read: false,
      },
    })

    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL
    if (resendApiKey && fromEmail) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: fromEmail,
          to: updated.instructor.email,
          subject: "Course Assignment: Upload Recorded Classes",
          text: message,
        })
      } catch {
        // Non-blocking catch
      }
    }
  }

  return NextResponse.json({ course: updated })
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params

  const existingCourse = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  })
  if (!existingCourse) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  await db.course.delete({ where: { id: courseId } })
  return NextResponse.json({ success: true })
}

