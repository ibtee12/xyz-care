import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Menu,
  Clock,
  BookOpen
} from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { VideoPlayer } from "@/components/student/video-player"
import { BookmarkButton } from "@/components/student/bookmark-button"
import { Button } from "@/components/ui/button"

type PageProps = { params: Promise<{ courseId: string; lessonId: string }> }

export default async function StudentLessonPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    redirect("/login")
  }

  const { courseId, lessonId } = await params

  // 1. Verify enrollment and fetch course/lessons
  const enrollment = await db.enrollment.findUnique({
    where: {
      student_id_course_id: {
        student_id: session.user.id,
        course_id: courseId,
      },
    },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: { student_id: session.user.id }
              }
            }
          },
        },
      },
    },
  })

  if (!enrollment || enrollment.course.course_type !== "online") {
    notFound()
  }

  const { course } = enrollment
  const currentLesson = course.lessons.find(l => l.id === lessonId)

  if (!currentLesson) {
    notFound()
  }

  const isCompleted = currentLesson.progress.some(p => p.is_completed)

  const bookmark = await db.lessonBookmark.findUnique({
    where: { student_id_lesson_id: { student_id: session.user.id, lesson_id: lessonId } },
    select: { id: true },
  })
  const isBookmarked = !!bookmark

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Left Column: Video & Details */}
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <Link 
            href={`/student/courses/${courseId}`} 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Playlist
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">
              {currentLesson.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Lesson {currentLesson.order}</span>
              {currentLesson.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {Math.floor(currentLesson.duration / 60)} Minutes
                </span>
              )}
            </div>
            <BookmarkButton lessonId={lessonId} initial={isBookmarked} />
          </div>
        </div>

        <VideoPlayer 
          lessonId={lessonId} 
          videoUrl={currentLesson.video_url} 
          initialCompleted={isCompleted} 
        />

        <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">About this Lesson</h3>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
            {currentLesson.description || "No description provided for this lesson."}
          </div>
          
          <div className="my-8 h-px bg-gray-100" />
          
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
              {course.instructor.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Instructor</p>
              <p className="text-base font-bold text-gray-900">{course.instructor.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sidebar Playlist */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 overflow-hidden sticky top-8">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Menu className="size-4 text-indigo-600" />
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Course Playlist</h4>
            </div>
            <p className="text-xs text-gray-400 font-medium truncate">{course.title}</p>
          </div>
          
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {course.lessons.map((lesson) => {
              const isActive = lesson.id === lessonId
              const isFinished = lesson.progress.some(p => p.is_completed)
              
              return (
                <Link 
                  key={lesson.id} 
                  href={`/student/courses/${courseId}/lesson/${lesson.id}`}
                  className={`flex items-start gap-3 p-4 transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                    isActive ? "bg-indigo-50/50 ring-2 ring-inset ring-indigo-500/10" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isFinished ? (
                      <div className="rounded-full bg-emerald-100 p-1 text-emerald-600">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                    ) : (
                      <div className={`rounded-full p-1 ${isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <PlayCircle className="size-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold leading-tight ${isActive ? "text-indigo-600" : "text-gray-700"}`}>
                      {lesson.title}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Class {lesson.order}</p>
                  </div>
                  {isActive && <div className="size-1.5 rounded-full bg-indigo-600 mt-2" />}
                </Link>
              )
            })}
          </div>
          
          <div className="p-6 bg-gray-50/30 border-t border-gray-100">
            <Button variant="outline" className="w-full rounded-xl border-gray-200 text-xs font-bold gap-2" asChild>
              <Link href={`/student/courses/${courseId}`}>
                <BookOpen className="size-3.5" /> Course Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
