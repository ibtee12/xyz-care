import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type PageParams = {
  params: Promise<{ examId: string }>
}

export default async function StudentExamResultPage({ params }: PageParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    redirect("/login")
  }

  const { examId } = await params

  const exam = await db.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      title: true,
      subject: true,
      exam_date: true,
      total_marks: true,
    },
  })

  if (!exam) {
    notFound()
  }

  const [ownMark, highestMark] = await Promise.all([
    db.studentMark.findFirst({
      where: {
        exam_id: exam.id,
        student_id: session.user.id,
      },
      select: {
        marks_obtained: true,
        remarks: true,
        created_at: true,
      },
    }),
    db.studentMark.aggregate({
      where: { exam_id: exam.id },
      _max: { marks_obtained: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.subject} • {new Date(exam.exam_date).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/student/marks">Back to Marks</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Mark</CardTitle>
            <CardDescription>Your submitted score for this exam.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {ownMark?.marks_obtained ?? "N/A"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Mark</CardTitle>
            <CardDescription>Top score among all students in this exam.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {highestMark._max.marks_obtained ?? "N/A"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Marks</CardTitle>
            <CardDescription>Maximum achievable marks for this exam.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{exam.total_marks}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
          <CardDescription>Feedback recorded for your exam result.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{ownMark?.remarks ?? "No remarks available."}</p>
          <p>
            Published:{" "}
            {ownMark?.created_at ? new Date(ownMark.created_at).toLocaleString() : "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
