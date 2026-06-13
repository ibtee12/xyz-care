import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { BookOpen, Info } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { StudentCoursesClient } from "./courses-client"

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const enrollments = await db.enrollment.findMany({
    where: { student_id: session.user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          course_type: true,
          location: true,
          schedule: true,
          batch: true,
          _count: { select: { lessons: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  const data = enrollments.map((e) => ({
    id: e.id,
    progress: e.progress,
    course: e.course,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Learning</h1>
          <p className="mt-1 text-sm text-gray-500">Access your online classes and offline course details.</p>
        </div>
        <Link href="/courses" className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700">
          Browse More <Info className="size-4" />
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <EmptyState icon={BookOpen} title="No enrollments found" description="You haven't enrolled in any courses yet." />
          <div className="mt-6 text-center">
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all">
              Explore Courses
            </Link>
          </div>
        </div>
      ) : (
        <StudentCoursesClient enrollments={data} />
      )}
    </div>
  )
}
