import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ threadId: string }> }

export async function GET(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { threadId } = await params
  const thread = await db.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: { select: { id: true, name: true, role: true } },
      replies: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { created_at: "asc" },
      },
    },
  })

  if (!thread) return NextResponse.json({ error: "Not found." }, { status: 404 })
  return NextResponse.json({ thread })
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { threadId } = await params
  const thread = await db.forumThread.findUnique({ where: { id: threadId }, select: { author_id: true } })
  if (!thread) return NextResponse.json({ error: "Not found." }, { status: 404 })

  if (thread.author_id !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  await db.forumThread.delete({ where: { id: threadId } })
  return NextResponse.json({ success: true })
}
