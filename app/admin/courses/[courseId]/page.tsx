import Link from "next/link"
import { notFound } from "next/navigation"
import { Globe, MapPin, Calendar, Layers, Users, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

type PageProps = {
  params: Promise<{ courseId: string }>
}

export default async function AdminCourseDetailPage({ params }: PageProps) {
  const { courseId } = await params

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: { name: true, email: true },
      },
      lessons: {
        orderBy: { order: "asc" },
      },
      enrollments: {
        include: {
          student: {
            select: { name: true, email: true, roll_number: true },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  })

  if (!course) {
    notFound()
  }

  const isOffline = course.course_type === "offline"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 h-auto px-2 text-muted-foreground" asChild>
            <Link href="/admin/courses">← Back to courses</Link>
          </Button>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{course.title}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                isOffline ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {isOffline ? "Offline" : "Online"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.slug} · BDT {Number(course.price).toLocaleString("en-BD")} ·{" "}
            {course.is_published ? "Published live" : "Draft"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/courses/${course.id}/edit`}>Edit Course</Link>
        </Button>
      </div>

      {/* Main Details Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Course Info Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Type Details</CardTitle>
            <CardDescription>Configuration attributes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOffline ? (
              <div className="space-y-3 rounded-xl bg-amber-50/50 p-4 border border-amber-100">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-950">Location / Address</p>
                    <p className="text-sm text-amber-900 mt-0.5">{course.location || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-950">Schedule</p>
                    <p className="text-sm text-amber-900 mt-0.5">{course.schedule || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Layers className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-950">Batch Info</p>
                    <p className="text-sm text-amber-900 mt-0.5">{course.batch || "Not specified"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl bg-indigo-50/50 p-4 border border-indigo-100">
                <div className="flex items-start gap-2">
                  <Globe className="size-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Assigned Teacher</p>
                    <p className="text-sm text-indigo-900 font-medium mt-0.5">{course.instructor.name}</p>
                    <p className="text-xs text-indigo-600">{course.instructor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-indigo-100/60">
                  <BookOpen className="size-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-950">{course.lessons.length} Recorded Lessons</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Users className="size-3.5" /> Total Enrolled
              </span>
              <span className="font-bold">{course.enrollments.length} students</span>
            </div>
          </CardContent>
        </Card>

        {/* Content list panel depending on type */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{isOffline ? "Enrolled Students List" : "Uploaded Recorded Lessons"}</CardTitle>
            <CardDescription>
              {isOffline
                ? "Students attending physical sessions for this batch."
                : "Playlist tracks available to digital watchers."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOffline ? (
              course.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No students enrolled yet.</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {course.enrollments.map((en) => (
                    <div key={en.id} className="flex items-center justify-between p-3 sm:px-4">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{en.student.name}</p>
                        <p className="text-xs text-gray-400">{en.student.email}</p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-mono font-semibold text-gray-600">
                        Roll: {en.student.roll_number || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              course.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No recorded lessons uploaded yet.</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {course.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 sm:px-4">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          <span className="text-indigo-600 font-mono mr-1.5">{lesson.order}.</span>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {lesson.video_url || "No video URL mapped"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-mono text-gray-500">
                        {lesson.duration ? `${Math.round(lesson.duration / 60)} mins` : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
