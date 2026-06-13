import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { BookOpen, ChevronRight, Users, PlusCircle } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function TeacherCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") redirect("/login")

  const courses = await db.course.findMany({
    where: { instructor_id: session.user.id, course_type: "online" },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      is_published: true,
      price: true,
      _count: { select: { enrollments: true, lessons: true } },
    },
  })

  const gradients = [
    "from-indigo-500 to-violet-500",
    "from-cyan-500 to-teal-500",
    "from-emerald-500 to-green-500",
    "from-amber-500 to-orange-500",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Courses (Online)</h1>
        <p className="mt-1 text-sm text-gray-500">Online courses assigned to you for uploading recorded video lessons.</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={BookOpen} title="No online courses assigned" description="Ask an admin to assign you as the instructor for an online course." />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course, idx) => (
            <div key={course.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 flex flex-col justify-between">
              <div>
                <div className={`h-2 bg-gradient-to-r ${gradients[idx % gradients.length]}`} />
                <div className="p-6 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-gray-800">{course.title}</h2>
                      <p className="text-xs text-gray-400">{course.slug}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${course.is_published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {course.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {course._count.enrollments} enrolled
                    </span>
                    <span>{course._count.lessons} lessons</span>
                    <span className="ml-auto font-semibold text-gray-600">
                      BDT {Number(course.price).toLocaleString("en-BD")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-3 flex items-center gap-2">
                <Link
                  href={`/teacher/courses/${course.id}/upload`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  <PlusCircle className="size-3.5" /> Upload Class
                </Link>
                <Link
                  href={`/teacher/courses/${course.id}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  title="Manage Lessons"
                >
                  Playlist <ChevronRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

