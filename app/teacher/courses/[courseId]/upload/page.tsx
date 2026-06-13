import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { Button } from "@/components/ui/button"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UploadForm } from "./upload-form"

type PageProps = {
  params: Promise<{ courseId: string }>
}

export default async function TeacherUploadLessonPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "teacher") {
    redirect("/login")
  }

  const { courseId } = await params

  const course = await db.course.findFirst({
    where: { id: courseId, instructor_id: session.user.id, course_type: "online" },
    select: { id: true, title: true },
  })

  if (!course) {
    notFound()
  }

  const agg = await db.lesson.aggregate({
    where: { course_id: courseId },
    _max: { order: true },
  })

  const nextOrder = String((agg._max.order ?? -1) + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2 h-auto px-2 text-muted-foreground font-bold text-xs" asChild>
          <Link href={`/teacher/courses/${course.id}`}>← Back to lesson playlist</Link>
        </Button>
      </div>

      <UploadForm courseId={course.id} courseTitle={course.title} nextOrder={nextOrder} />
    </div>
  )
}
