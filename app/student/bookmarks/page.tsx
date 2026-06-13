import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Bookmark, PlayCircle, BookOpen } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function StudentBookmarksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const bookmarks = await db.lessonBookmark.findMany({
    where: { student_id: session.user.id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
          duration: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Bookmarks</h1>
        <p className="mt-1 text-sm text-gray-500">Lessons you saved for later.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-50">
            <Bookmark className="size-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No bookmarks yet</h3>
          <p className="mt-1 text-sm text-gray-400">Open any lesson and click Bookmark to save it here.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bookmarks.map((b) => (
            <Link
              key={b.id}
              href={`/student/courses/${b.lesson.course.id}/lesson/${b.lesson.id}`}
              className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-indigo-200 hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PlayCircle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-800 group-hover:text-indigo-600">{b.lesson.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <BookOpen className="size-3" />
                  <span className="truncate">{b.lesson.course.title}</span>
                  <span>·</span>
                  <span>Lesson {b.lesson.order}</span>
                  {b.lesson.duration && <span>· {Math.floor(b.lesson.duration / 60)}m</span>}
                </div>
              </div>
              <Bookmark className="size-4 shrink-0 fill-amber-400 text-amber-400 mt-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
