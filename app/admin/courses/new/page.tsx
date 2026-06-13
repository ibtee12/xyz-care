import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

import { CourseForm } from "../course-form"

export default async function NewCoursePage() {
  const instructors = await db.user.findMany({
    where: { role: { in: ["teacher", "admin"] } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="text-sm text-muted-foreground">
          Add a new course and assign its instructor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Course Form</CardTitle>
          <CardDescription>Fill in the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            mode="create"
            instructors={instructors}
            initialValues={{
              title: "",
              slug: "",
              description: "",
              price: "",
              thumbnail: "",
              instructorId: instructors[0]?.id ?? "",
              isPublished: false,
              courseType: "online",
              location: "",
              schedule: "",
              time: "",
              batch: "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
