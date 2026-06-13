import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { studentEnrolledInTeacherCourse } from "@/lib/teacher-scope"

type PostBody = {
  recipientId: string
  message: string
  image_url?: string | null
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const withUserId = new URL(request.url).searchParams.get("withUserId")
  if (!withUserId) {
    return NextResponse.json({ error: "withUserId is required." }, { status: 400 })
  }

  const allowed = await studentEnrolledInTeacherCourse(session.user.id, withUserId)
  if (!allowed) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  const messages = await db.chatMessage.findMany({
    where: {
      OR: [
        { sender_id: session.user.id, recipient_id: withUserId },
        { sender_id: withUserId, recipient_id: session.user.id },
      ],
    },
    orderBy: { created_at: "asc" },
    take: 200,
    include: {
      sender: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as PostBody
  const recipientId = body.recipientId?.trim()
  const text = body.message?.trim() ?? ""
  const imageUrl = body.image_url?.trim() || null
  if (!recipientId || (!text && !imageUrl)) {
    return NextResponse.json({ error: "recipientId and message or image are required." }, { status: 400 })
  }

  const allowed = await studentEnrolledInTeacherCourse(session.user.id, recipientId)
  if (!allowed) {
    return NextResponse.json({ error: "Student not in your courses." }, { status: 403 })
  }

  const message = await db.chatMessage.create({
    data: {
      sender_id: session.user.id,
      recipient_id: recipientId,
      message: text || " ",
      image_url: imageUrl,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ message }, { status: 201 })
}
