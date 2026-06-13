import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ threadId: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { threadId } = await params
  const { content } = (await request.json()) as { content?: string }
  if (!content?.trim()) {
    return NextResponse.json({ error: "content is required." }, { status: 400 })
  }

  const thread = await db.forumThread.findUnique({ where: { id: threadId }, select: { id: true, is_locked: true } })
  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 })
  if (thread.is_locked) return NextResponse.json({ error: "Thread is locked." }, { status: 403 })

  const reply = await db.forumReply.create({
    data: { thread_id: threadId, author_id: session.user.id, content: content.trim() },
    include: { author: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json({ reply }, { status: 201 })
}
