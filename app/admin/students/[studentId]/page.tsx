import { notFound } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"

type PageParams = {
  params: Promise<{ studentId: string }>
}

export default async function AdminStudentDetailPage({ params }: PageParams) {
  const { studentId } = await params

  const student = await db.user.findFirst({
    where: { id: studentId, role: "student" },
    select: {
      id: true,
      name: true,
      email: true,
      roll_number: true,
      phone: true,
      enrollments: {
        select: { id: true },
      },
    },
  })

  if (!student) {
    notFound()
  }

  const [marks, payments] = await Promise.all([
    db.studentMark.findMany({
      where: { student_id: studentId },
      include: {
        exam: {
          select: {
            title: true,
            subject: true,
            total_marks: true,
            exam_date: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    db.payment.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: "desc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
        <p className="text-sm text-muted-foreground">
          {student.email} • Roll: {student.roll_number ?? "N/A"}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Roll Number</CardTitle>
          </CardHeader>
          <CardContent>{student.roll_number ?? "N/A"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phone</CardTitle>
          </CardHeader>
          <CardContent>{student.phone ?? "N/A"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Courses Enrolled</CardTitle>
          </CardHeader>
          <CardContent>{student.enrollments.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Payments</CardTitle>
          </CardHeader>
          <CardContent>{payments.length}</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Marks</CardTitle>
          <CardDescription>All recorded exam marks for this student.</CardDescription>
        </CardHeader>
        <CardContent>
          {marks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No marks available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mark</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell className="font-medium">{mark.exam.title}</TableCell>
                    <TableCell>{mark.exam.subject}</TableCell>
                    <TableCell>{new Date(mark.exam.exam_date).toLocaleDateString()}</TableCell>
                    <TableCell>{mark.marks_obtained}</TableCell>
                    <TableCell>{mark.exam.total_marks}</TableCell>
                    <TableCell>{mark.remarks ?? "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>All payment transactions for this student.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Txn ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>BDT {Number(payment.amount).toLocaleString("en-BD")}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{payment.txn_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
