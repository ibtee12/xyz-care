import { db } from "@/lib/db"

import { StudentsTable } from "./students-table"

export default async function AdminStudentsPage() {
  const [students, enrollments, payments] = await Promise.all([
    db.user.findMany({
      where: { role: "student" },
      select: {
        id: true,
        name: true,
        email: true,
        roll_number: true,
        classLevel: true,
        student_batch: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    }),
    db.enrollment.groupBy({
      by: ["student_id"],
      _count: { _all: true },
    }),
    db.payment.findMany({
      select: {
        student_id: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    }),
  ])

  const enrollmentCountByStudent = new Map(
    enrollments.map((item) => [item.student_id, item._count._all])
  )

  const paymentStatusByStudent = new Map<string, string>()
  for (const payment of payments) {
    if (paymentStatusByStudent.has(payment.student_id)) continue
    const normalized = payment.status.toLowerCase()
    paymentStatusByStudent.set(
      payment.student_id,
      ["paid", "success", "completed"].includes(normalized) ? "Paid" : payment.status
    )
  }

  const rows = students.map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    rollNumber: student.roll_number ?? "N/A",
    classLevel: student.classLevel ?? "N/A",
    batch: student.student_batch ?? "Unassigned",
    createdAt: student.created_at.toISOString(),
    enrolledCoursesCount: enrollmentCountByStudent.get(student.id) ?? 0,
    paymentStatus: paymentStatusByStudent.get(student.id) ?? "Due",
  }))

  return <StudentsTable rows={rows} />
}
