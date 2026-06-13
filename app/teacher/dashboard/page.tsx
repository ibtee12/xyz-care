import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { BookOpen, Users, Video, ChevronRight } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-md`}>
      <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-white/10" />
      <Icon className="mb-3 size-7 opacity-80" />
      <p className="text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-semibold opacity-80">{label}</p>
    </div>
  )
}

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") redirect("/login")

  const teacherId = session.user.id

  const [courses, totalEnrolled, courseCount] = await Promise.all([
    db.course.findMany({
      where: { instructor_id: teacherId },
      select: {
        id: true,
        title: true,
        is_published: true,
        _count: { select: { enrollments: true, lessons: true } },
      },
      orderBy: { created_at: "desc" },
      take: 8,
    }),
    db.enrollment.count({ where: { course: { instructor_id: teacherId } } }),
    db.course.count({ where: { instructor_id: teacherId } }),
  ])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-700 p-6 text-white shadow-md">
        <p className="text-sm font-medium text-teal-200">Welcome back 👋</p>
        <h1 className="mt-1 text-2xl font-extrabold">{session.user.name}</h1>
        <p className="mt-1 text-xs text-teal-200">Teacher Dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My Courses" value={courseCount} icon={BookOpen} gradient="from-cyan-500 to-teal-600" />
        <StatCard label="Total Students" value={totalEnrolled} icon={Users} gradient="from-indigo-500 to-violet-600" />
        <StatCard label="Live Classes" value={0} icon={Video} gradient="from-amber-500 to-orange-600" />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-800">Your Courses</h2>
          <Link href="/teacher/courses" className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline">
            View all <ChevronRight className="size-3" />
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No courses assigned yet. Ask an admin to assign you as instructor.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {courses.map((course) => (
              <li key={course.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">{course.title}</p>
                  <p className="text-xs text-gray-400">
                    {course._count.enrollments} students · {course._count.lessons} lessons
                    {!course.is_published ? " · Draft" : ""}
                  </p>
                </div>
                <Link
                  href={`/teacher/courses/${course.id}`}
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 sm:self-center"
                >
                  Manage <ChevronRight className="size-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
