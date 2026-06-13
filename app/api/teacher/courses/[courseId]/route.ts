import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ courseId: string }> }

export async function GET(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId } = await params

  const course = await db.course.findFirst({
    where: { id: courseId, instructor_id: session.user.id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  })

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 })
  }

  const { price, ...rest } = course
  return NextResponse.json({
    course: {
      ...rest,
      price: Number(price),
    },
  })
}
