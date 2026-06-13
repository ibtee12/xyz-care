import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

import { CoursesTable } from "./courses-table"

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    include: {
      instructor: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage all courses, publication status, and instructor assignments.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">New Course</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Edit or delete course records.</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses found.</p>
          ) : (
            <CoursesTable
              rows={courses.map((course) => ({
                id: course.id,
                title: course.title,
                instructor: course.instructor.name,
                price: Number(course.price),
                isPublished: course.is_published,
                courseType: course.course_type,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

