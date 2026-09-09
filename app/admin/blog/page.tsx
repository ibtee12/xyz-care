import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminBlogClient } from "./blog-client"

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  const posts = await db.blogPost.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage blog posts.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="size-4" /> New Post
        </Link>
      </div>

      <AdminBlogClient posts={posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        is_published: p.is_published,
        author: p.author.name,
        created_at: p.created_at.toISOString(),
        published_at: p.published_at?.toISOString() ?? null,
      }))} />
    </div>
  )
}
