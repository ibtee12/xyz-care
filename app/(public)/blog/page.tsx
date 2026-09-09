import Link from "next/link"
import { PenSquare, User, Calendar } from "lucide-react"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function PublicBlogPage() {
  const posts = await db.blogPost.findMany({
    where: { is_published: true },
    include: { author: { select: { name: true } } },
    orderBy: { published_at: "desc" },
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-indigo-50/50 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-black uppercase tracking-widest text-indigo-700">
            Blog
          </span>
          <h1 className="text-4xl font-black text-gray-900 sm:text-5xl">Insights & Updates</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Tips, guides, and news from the Matrix Math Care team.
          </p>
        </div>
      </section>

      <main className="container mx-auto max-w-4xl px-4 py-16">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <PenSquare className="mb-4 size-12 text-gray-200" />
            <p className="text-gray-400">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <h2 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-500">
                  {post.content.slice(0, 200)}{post.content.length > 200 ? "…" : ""}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1"><User className="size-3" />{post.author.name}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-bold text-indigo-600 group-hover:underline">
                  Read more →
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
