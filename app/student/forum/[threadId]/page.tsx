import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ThreadDetailClient } from "./thread-client"

type PageProps = { params: Promise<{ threadId: string }> }

export default async function ForumThreadPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

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

  if (!thread) notFound()

  return (
    <ThreadDetailClient
      userId={session.user.id}
      thread={{
        id: thread.id,
        title: thread.title,
        content: thread.content,
        is_locked: thread.is_locked,
        created_at: thread.created_at.toISOString(),
        author: thread.author,
        replies: thread.replies.map((r) => ({
          id: r.id,
          content: r.content,
          created_at: r.created_at.toISOString(),
          author: r.author,
        })),
      }}
    />
  )
}
