import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const certificates = await db.certificate.findMany({
    where: { student_id: session.user.id },
    include: { course: { select: { title: true, instructor: { select: { name: true } } } } },
    orderBy: { issued_at: "desc" },
  })

  return NextResponse.json({ certificates })
}
