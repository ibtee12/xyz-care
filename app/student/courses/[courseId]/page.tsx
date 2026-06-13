import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Lock,
  MapPin,
  PlayCircle,
  User,
  Video,
} from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LiveClassRow } from "@/components/student/live-class-row"

type PageProps = { params: Promise<{ courseId: string }> }

export default async function StudentCourseDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const { courseId } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(courseId)) notFound()

  const enrollment = await db.enrollment.findUnique({
    where: { student_id_course_id: { student_id: session.user.id, course_id: courseId } },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, duration: true, order: true },
          },
          live_classes: {
            orderBy: { scheduled_at: "asc" },
            include: { teacher: { select: { name: true } } },
          },
        },
      },
    },
  })

  if (!enrollment) notFound()

  const course = enrollment.course
  const isOnline = course.course_type === "online"

  const totalDuration = course.lessons.reduce((sum: number, l) => sum + (l.duration ?? 0), 0)
  const durationLabel =
    totalDuration > 0
      ? totalDuration >= 60
        ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
        : `${totalDuration}m`
      : null

  const now = new Date()
  const upcoming = course.live_classes.filter(
    (lc) => new Date(lc.scheduled_at).getTime() + lc.join_window_minutes * 60_000 >= now.getTime()
  )
  const past = course.live_classes.filter(
    (lc) => new Date(lc.scheduled_at).getTime() + lc.join_window_minutes * 60_000 < now.getTime()
  )

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to My Courses
      </Link>

      {/* Course header */}
      <div
        className={`rounded-3xl p-6 text-white shadow-lg ${
          isOnline
            ? "bg-gradient-to-br from-indigo-600 to-violet-700"
            : "bg-gradient-to-br from-amber-500 to-orange-600"
        }`}
      >
        <span className="mb-3 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
          {course.course_type}
        </span>
        <h1 className="text-2xl font-extrabold">{course.title}</h1>
        {course.description && (
          <p className="mt-2 text-sm text-white/80 line-clamp-3">{course.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
          {isOnline && (
            <>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" /> {course.lessons.length} lessons
              </span>
              {durationLabel && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" /> {durationLabel} total
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Video className="size-4" /> {upcoming.length} upcoming live class{upcoming.length !== 1 ? "es" : ""}
              </span>
            </>
          )}
          {!isOnline && (
            <>
              {course.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {course.location}
                </span>
              )}
              {course.schedule && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> {course.schedule}
                </span>
              )}
              {course.batch && (
                <span className="flex items-center gap-1.5">
                  <User className="size-4" /> {course.batch}
                </span>
              )}
            </>
          )}
        </div>

        {isOnline && course.lessons.length > 0 && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
              <span>Progress</span>
              <span className="font-bold text-white">{enrollment.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lessons (online only) */}
      {isOnline && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <PlayCircle className="size-4 text-indigo-500" /> Course Lessons
            </h2>
          </div>

          {course.lessons.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No lessons published yet. Check back soon.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {course.lessons.map((lesson, i) => (
                <Link
                  key={lesson.id}
                  href={`/student/courses/${courseId}/lesson/${lesson.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-indigo-50/50 group"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-indigo-700">
                      {lesson.title}
                    </p>
                    {lesson.duration && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="size-3" /> {lesson.duration} min
                      </p>
                    )}
                  </div>
                  <PlayCircle className="size-5 shrink-0 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Classes (online only) */}
      {isOnline && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Video className="size-4 text-emerald-500" /> Live Classes
            </h2>
            {upcoming.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-700">
                {upcoming.length} upcoming
              </span>
            )}
          </div>

          {course.live_classes.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center px-6">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-50">
                <Video className="size-6 text-emerald-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No live classes scheduled yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Your instructor will post upcoming sessions here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.length > 0 && (
                <>
                  <div className="px-6 py-2 bg-emerald-50/60">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      Upcoming
                    </span>
                  </div>
                  {upcoming.map((lc) => (
                    <LiveClassRow
                      key={lc.id}
                      id={lc.id}
                      title={lc.title}
                      description={lc.description}
                      meetLink={lc.meet_link}
                      scheduledAt={lc.scheduled_at.toISOString()}
                      joinWindowMinutes={lc.join_window_minutes}
                      duration={lc.duration}
                      teacherName={lc.teacher.name ?? ""}
                    />
                  ))}
                </>
              )}

              {past.length > 0 && (
                <>
                  <div className="px-6 py-2 bg-gray-50/80">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Past
                    </span>
                  </div>
                  {past.map((lc) => (
                    <LiveClassRow
                      key={lc.id}
                      id={lc.id}
                      title={lc.title}
                      description={lc.description}
                      meetLink={lc.meet_link}
                      scheduledAt={lc.scheduled_at.toISOString()}
                      joinWindowMinutes={lc.join_window_minutes}
                      duration={lc.duration}
                      teacherName={lc.teacher.name ?? ""}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Offline course info */}
      {!isOnline && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Course Schedule & Location</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, label: "Venue", val: course.location || "TBA" },
              { icon: Calendar, label: "Schedule", val: course.schedule || "TBA" },
              { icon: User, label: "Batch", val: course.batch || "TBA" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="rounded-xl bg-amber-50 p-4">
                <div className="mb-1.5 flex items-center gap-2 text-amber-600">
                  <Icon className="size-4" />
                  <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
