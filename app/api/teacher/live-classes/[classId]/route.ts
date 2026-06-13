import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ classId: string }> }

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { classId } = await params
  const lc = await db.liveClass.findUnique({ where: { id: classId }, select: { teacher_id: true } })
  if (!lc || lc.teacher_id !== session.user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  await db.liveClass.delete({ where: { id: classId } })
  return NextResponse.json({ success: true })
}
