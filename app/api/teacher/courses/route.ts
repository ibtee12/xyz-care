import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const courses = await db.course.findMany({
    where: { instructor_id: session.user.id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      is_published: true,
      created_at: true,
      _count: { select: { enrollments: true, lessons: true } },
    },
  })

  return NextResponse.json({
    courses: courses.map((c) => ({
      ...c,
      price: Number(c.price),
    })),
  })
}
