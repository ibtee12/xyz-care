"use client"

import Link from "next/link"
import { useState } from "react"
import { Globe, EyeOff, Pencil, Trash2, PenSquare } from "lucide-react"

type Post = {
  id: string
  title: string
  slug: string
  is_published: boolean
  author: string
  created_at: string
  published_at: string | null
}

export function AdminBlogClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial)

  const togglePublish = async (post: Post) => {
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !post.is_published }),
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, is_published: !p.is_published } : p))
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
        <PenSquare className="mb-3 size-10 text-gray-200" />
        <p className="text-sm font-semibold text-gray-400">No posts yet. Write your first article.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-6 py-3 text-left">Title</th>
            <th className="px-6 py-3 text-left">Author</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {posts.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-800 truncate max-w-xs">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">/blog/{p.slug}</p>
              </td>
              <td className="px-6 py-4 text-gray-600">{p.author}</td>
              <td className="px-6 py-4">
                <button onClick={() => togglePublish(p)} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${p.is_published ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {p.is_published ? <><Globe className="size-3" /> Published</> : <><EyeOff className="size-3" /> Draft</>}
                </button>
              </td>
              <td className="px-6 py-4 text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/blog/${p.id}/edit`} className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600">
                    <Pencil className="size-4" />
                  </Link>
                  <button onClick={() => deletePost(p.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
