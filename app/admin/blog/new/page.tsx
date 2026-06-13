import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { BlogPostForm } from "../blog-form"

export default async function AdminNewBlogPostPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")
  return <BlogPostForm mode="create" />
}
