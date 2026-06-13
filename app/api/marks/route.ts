import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const exams = await db.exam.findMany({
    select: {
      id: true,
      title: true,
      subject: true,
      exam_date: true,
      total_marks: true,
    },
    orderBy: { exam_date: "desc" },
  })

  return NextResponse.json({ exams })
}
