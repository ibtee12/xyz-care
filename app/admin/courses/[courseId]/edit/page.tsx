import { notFound } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

import { CourseForm } from "../../course-form"

type PageParams = {
  params: Promise<{ courseId: string }>
}

export default async function EditCoursePage({ params }: PageParams) {
  const { courseId } = await params

  const [course, instructors] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        thumbnail: true,
        instructor_id: true,
        is_published: true,
        course_type: true,
        location: true,
        schedule: true,
        time: true,
        batch: true,
      },
    }),
    db.user.findMany({
      where: { role: { in: ["teacher", "admin"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!course) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
        <p className="text-sm text-muted-foreground">
          Update course details, pricing, and publication status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>Modify this course record.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            mode="edit"
            courseId={course.id}
            instructors={instructors}
            initialValues={{
              title: course.title,
              slug: course.slug,
              description: course.description ?? "",
              price: String(Number(course.price)),
              thumbnail: course.thumbnail ?? "",
              instructorId: course.instructor_id,
              isPublished: course.is_published,
              courseType: course.course_type as "online" | "offline",
              location: course.location ?? "",
              schedule: course.schedule ?? "",
              time: course.time ?? "",
              batch: course.batch ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
