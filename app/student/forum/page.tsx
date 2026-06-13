import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ForumClient } from "./forum-client"

export default async function StudentForumPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const threads = await db.forumThread.findMany({
    include: {
      author: { select: { name: true, role: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <ForumClient
      userId={session.user.id}
      threads={threads.map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        is_locked: t.is_locked,
        created_at: t.created_at.toISOString(),
        author: t.author,
        replyCount: t._count.replies,
      }))}
    />
  )
}
