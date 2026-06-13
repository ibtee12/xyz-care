import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { LessonManager } from "@/components/teacher/lesson-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type PageProps = { params: Promise<{ courseId: string }> }

export default async function TeacherCourseDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "teacher") {
    redirect("/login")
  }

  const { courseId } = await params

  const course = await db.course.findFirst({
    where: { id: courseId, instructor_id: session.user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      is_published: true,
      price: true,
      _count: { select: { enrollments: true } },
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 h-auto px-2 text-muted-foreground" asChild>
            <Link href="/teacher/courses">← Back to courses</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{course.title}</h1>
          <p className="text-sm text-muted-foreground">
            {course.is_published ? "Published" : "Draft"} · {course._count.enrollments} students · BDT{" "}
            {Number(course.price).toLocaleString("en-BD")}
          </p>
          {course.description ? (
            <p className="max-w-2xl pt-2 text-sm text-muted-foreground">{course.description}</p>
          ) : null}
        </div>
        <Button asChild className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
          <Link href={`/teacher/courses/${course.id}/upload`}>Upload New Class</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
          <CardDescription>Add, edit, or remove lessons for this course. Order controls display sequence.</CardDescription>
        </CardHeader>
        <CardContent>
          <LessonManager key={course.id} courseId={course.id} />
        </CardContent>
      </Card>
    </div>
  )
}
