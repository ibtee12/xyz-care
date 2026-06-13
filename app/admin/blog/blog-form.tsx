"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Save, Globe, EyeOff } from "lucide-react"
import Link from "next/link"

type Props =
  | { mode: "create" }
  | { mode: "edit"; post: { id: string; title: string; slug: string; content: string; is_published: boolean } }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function BlogPostForm(props: Props) {
  const router = useRouter()
  const isEdit = props.mode === "edit"
  const initial = isEdit ? props.post : { title: "", slug: "", content: "", is_published: false }

  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)
  const [content, setContent] = useState(initial.content)
  const [published, setPublished] = useState(initial.is_published)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const onTitleChange = (val: string) => {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  const save = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug and content are required.")
      return
    }
    setSaving(true)
    setError("")
    const url = isEdit ? `/api/admin/blog/${props.post.id}` : "/api/admin/blog"
    const method = isEdit ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, content, is_published: published }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Failed to save."); setSaving(false); return }
    router.push("/admin/blog")
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft className="size-4" /> Back to Blog
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">{isEdit ? "Edit Post" : "New Post"}</h1>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Post title…"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug (URL)</label>
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
            <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content</label>
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-y font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPublished((v) => !v)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {published ? <><Globe className="size-4" /> Published</> : <><EyeOff className="size-4" /> Draft</>}
          </button>
          <p className="text-xs text-gray-400">Click to toggle publish status</p>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save className="size-4" />
          {saving ? "Saving…" : "Save Post"}
        </button>
      </div>
    </div>
  )
}
