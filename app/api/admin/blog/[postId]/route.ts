import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ postId: string }> }
type UpdateBody = { title?: string; slug?: string; content?: string; is_published?: boolean }

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { postId } = await params
  const body = (await request.json()) as UpdateBody
  const existing = await db.blogPost.findUnique({ where: { id: postId } })
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 })

  const wasPublished = existing.is_published
  const willPublish = body.is_published ?? existing.is_published

  const post = await db.blogPost.update({
    where: { id: postId },
    data: {
      title: body.title?.trim() ?? existing.title,
      slug: body.slug?.trim().toLowerCase().replace(/\s+/g, "-") ?? existing.slug,
      content: body.content?.trim() ?? existing.content,
      is_published: willPublish,
      published_at: !wasPublished && willPublish ? new Date() : existing.published_at,
    },
  })

  return NextResponse.json({ post })
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { postId } = await params
  await db.blogPost.delete({ where: { id: postId } })
  return NextResponse.json({ success: true })
}
