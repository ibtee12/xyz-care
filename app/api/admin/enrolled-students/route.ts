import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const courseId = req.nextUrl.searchParams.get("courseId")
  if (!courseId) return NextResponse.json({ students: [] })

  const enrollments = await db.enrollment.findMany({
    where: { course_id: courseId },
    include: {
      student: { select: { id: true, name: true, roll_number: true, email: true } },
    },
    orderBy: { student: { roll_number: "asc" } },
  })

  return NextResponse.json({
    students: enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      roll_number: e.student.roll_number ?? "",
      email: e.student.email,
    })),
  })
}
