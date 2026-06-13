import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type CreateBody = {
  title?: string
  slug?: string
  content?: string
  is_published?: boolean
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const posts = await db.blogPost.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { created_at: "desc" },
  })

  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateBody
  const title = body.title?.trim()
  const slug = body.slug?.trim().toLowerCase().replace(/\s+/g, "-")
  const content = body.content?.trim()

  if (!title || !slug || !content) {
    return NextResponse.json({ error: "title, slug and content are required." }, { status: 400 })
  }

  const existing = await db.blogPost.findUnique({ where: { slug }, select: { id: true } })
  if (existing) {
    return NextResponse.json({ error: "Slug already in use." }, { status: 409 })
  }

  const post = await db.blogPost.create({
    data: {
      title,
      slug,
      content,
      author_id: session.user.id,
      is_published: body.is_published ?? false,
      published_at: body.is_published ? new Date() : null,
    },
  })

  return NextResponse.json({ post }, { status: 201 })
}
