import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, User, Calendar } from "lucide-react"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { db } from "@/lib/db"

type PageProps = { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({
    where: { slug, is_published: true },
    include: { author: { select: { name: true } } },
  })

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto max-w-3xl px-4 py-16">
        <Link href="/blog" className="mb-8 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="size-4" /> All Posts
        </Link>

        <article>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl leading-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1"><User className="size-3" />{post.author.name}</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="my-8 h-px bg-gray-100" />

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
