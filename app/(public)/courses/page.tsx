import Link from "next/link"
import { getServerSession } from "next-auth"
import { BookOpen, ChevronRight, Search, MapPin, Calendar } from "lucide-react"

import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const SUBJECT_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-cyan-500 to-teal-500",
  "from-emerald-500 to-green-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
]

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isStudent = session?.user?.role === "student"
  const { type } = await searchParams

  const courses = await db.course.findMany({
    where: { 
      is_published: true,
      ...(type === "online" || type === "offline" ? { course_type: type } : {})
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      course_type: true,
      location: true,
      schedule: true,
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true, lessons: true } },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-700 to-indigo-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 size-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 size-96 bg-indigo-500 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center md:px-6">
          <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl">Explore Our Programs</h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto font-medium">
            Choose from our premium recorded online classes or physical venue-based offline courses.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {/* Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {[
            { label: "All Courses", value: undefined },
            { label: "Online (Videos)", value: "online" },
            { label: "Offline (In-Person)", value: "offline" },
          ].map((tab) => {
            const isActive = type === tab.value
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/courses?type=${tab.value}` : "/courses"}
                className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white text-gray-500 hover:text-gray-900 ring-1 ring-gray-100"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-gray-100 text-center">
            <div className="mx-auto size-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
              <Search className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
            <p className="text-sm text-gray-500 mt-1">Try switching to a different category or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const isOffline = course.course_type === "offline"
              return (
                <div
                  key={course.id}
                  id={course.slug}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      isOffline ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {course.course_type}
                    </span>
                  </div>

                  {/* Icon Area */}
                  <div className={`h-32 flex items-center justify-center transition-colors ${
                    isOffline ? "bg-amber-50" : "bg-indigo-50"
                  }`}>
                    <BookOpen className={`size-12 opacity-20 ${isOffline ? "text-amber-600" : "text-indigo-600"}`} />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3">
                      <h2 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">
                        By {course.instructor.name}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                      {course.description ?? "Access our premium training materials and expert instruction."}
                    </p>

                    <div className="mt-auto space-y-4">
                      {isOffline ? (
                        <div className="rounded-2xl bg-gray-50/50 p-3 space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            <MapPin className="size-3 text-amber-600" /> {course.location || "Location TBA"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                            <Calendar className="size-3 text-amber-600" /> {course.schedule || "Schedule TBA"}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          <span>{course._count.lessons} Lessons</span>
                          <span>{course._count.enrollments} Students</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investment</span>
                          <span className="text-lg font-black text-gray-900">
                            ৳{Number(course.price).toLocaleString("en-BD")}
                          </span>
                        </div>
                        <Link
                          href={isStudent ? `/student/payments?courseId=${course.id}` : `/courses/${course.slug}`}
                          className={`inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-xs font-black text-white transition-all shadow-md ${
                            isOffline 
                              ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" 
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                          }`}
                        >
                          {isStudent ? "Enroll Now" : "Learn More"}
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

