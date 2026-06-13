import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { BlogPostForm } from "../../blog-form"

type PageProps = { params: Promise<{ postId: string }> }

export default async function AdminEditBlogPostPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  const { postId } = await params
  const post = await db.blogPost.findUnique({ where: { id: postId } })
  if (!post) notFound()

  return (
    <BlogPostForm
      mode="edit"
      post={{ id: post.id, title: post.title, slug: post.slug, content: post.content, is_published: post.is_published }}
    />
  )
}
