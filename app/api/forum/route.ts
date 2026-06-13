import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const threads = await db.forumThread.findMany({
    include: {
      author: { select: { name: true, role: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { created_at: "desc" },
  })

  return NextResponse.json({ threads })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content } = (await request.json()) as { title?: string; content?: string }
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title and content are required." }, { status: 400 })
  }

  const thread = await db.forumThread.create({
    data: { title: title.trim(), content: content.trim(), author_id: session.user.id },
    include: { author: { select: { name: true, role: true } }, _count: { select: { replies: true } } },
  })

  return NextResponse.json({ thread }, { status: 201 })
}
