import { notFound } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

import { MarksSheetEditor } from "./sheet-editor"

type PageParams = {
  params: Promise<{ examId: string }>
}

export default async function AdminExamMarksPage({ params }: PageParams) {
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

  const marks = await db.studentMark.findMany({
    where: { exam_id: examId },
    select: {
      id: true,
      roll_number: true,
      marks_obtained: true,
      remarks: true,
      student: { select: { name: true } },
    },
    orderBy: { roll_number: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
        <p className="text-sm text-muted-foreground">
          {exam.subject} • {new Date(exam.exam_date).toLocaleDateString()} • Total{" "}
          {exam.total_marks}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Mark Sheet</CardTitle>
          <CardDescription>Edit marks and remarks for each student row.</CardDescription>
        </CardHeader>
        <CardContent>
          <MarksSheetEditor examId={exam.id} initialRows={marks} />
        </CardContent>
      </Card>
    </div>
  )
}
