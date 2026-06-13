import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type CreateCourseBody = {
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

export async function GET() {
  const courses = await db.course.findMany({
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return NextResponse.json({ courses })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateCourseBody
  const title = body.title?.trim()
  const slug = body.slug?.trim()
  const instructorId = body.instructor_id?.trim()
  const price = Number(body.price ?? 0)

  if (!title || !slug || !instructorId || !Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "title, slug, instructor_id and a valid price are required." },
      { status: 400 }
    )
  }

  const existingSlug = await db.course.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 })
  }

  const courseType = body.course_type === "offline" ? "offline" : "online"

  const created = await db.course.create({
    data: {
      title,
      slug,
      description: body.description?.trim() || null,
      instructor_id: instructorId,
      price,
      thumbnail: body.thumbnail?.trim() || null,
      is_published: Boolean(body.is_published),
      course_type: courseType,
      location: courseType === "offline" ? body.location?.trim() || null : null,
      schedule: body.schedule?.trim() || null,
      time: body.time?.trim() || null,
      batch: courseType === "offline" ? body.batch?.trim() || null : null,
    },
    include: {
      instructor: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  // When admin assigns a teacher to ONLINE course, automatically send notification and email
  if (courseType === "online" && created.instructor) {
    const message = `You have been assigned to upload recorded classes for ${created.title}. Please log in and start uploading your lessons.`
    
    // In-app notification
    await db.notification.create({
      data: {
        recipient_id: created.instructor.id,
        type: "alert",
        message,
        link: `/teacher/courses/${created.id}`,
        is_read: false,
      },
    })

    // Email to teacher
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL
    if (resendApiKey && fromEmail) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: fromEmail,
          to: created.instructor.email,
          subject: "Course Assignment: Upload Recorded Classes",
          text: message,
        })
      } catch {
        // Non-blocking catch
      }
    }
  }

  return NextResponse.json({ course: created }, { status: 201 })
}

