import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const enrolledCourseIds = await db.enrollment.findMany({
    where: { student_id: session.user.id },
    select: { course_id: true },
  })

  const ids = enrolledCourseIds.map((e) => e.course_id)

  const classes = await db.liveClass.findMany({
    where: { course_id: { in: ids } },
    include: {
      course: { select: { id: true, title: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { scheduled_at: "asc" },
  })

  return NextResponse.json({ classes })
}
