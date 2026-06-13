import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import { StudentPaymentsClient } from "./payments-client"

type PaymentsPageProps = {
  searchParams: Promise<{ courseId?: string }>
}

export default async function StudentPaymentsPage({ searchParams }: PaymentsPageProps) {
  const session = await getServerSession(authOptions)
  const { courseId } = await searchParams

  if (!session?.user?.id || session.user.role !== "student") {
    redirect("/login")
  }

  const [payments, enrollments, selectedCourse] = await Promise.all([
    db.payment.findMany({
      where: { student_id: session.user.id },
      orderBy: { created_at: "desc" },
    }),
    db.enrollment.findMany({
      where: { student_id: session.user.id },
      include: { course: { select: { price: true } } },
    }),
    courseId
      ? db.course.findUnique({
          where: { id: courseId },
          select: { id: true, title: true, price: true, slug: true },
        })
      : null,
  ])

  const totalPaid = payments
    .filter((payment) =>
      ["paid", "success", "completed", "valid"].includes(payment.status.toLowerCase())
    )
    .reduce((sum, payment) => sum + Number(payment.amount), 0)
  const totalFees = enrollments.reduce(
    (sum, enrollment) => sum + Number(enrollment.course.price),
    0
  )
  const pendingFees = Math.max(0, totalFees - totalPaid)

  return (
    <StudentPaymentsClient
      totalPaid={totalPaid}
      pendingFees={pendingFees}
      selectedCourse={
        selectedCourse
          ? {
              id: selectedCourse.id,
              title: selectedCourse.title,
              price: Number(selectedCourse.price),
            }
          : null
      }
      payments={payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        method: payment.method,
        status: payment.status,
        txnId: payment.txn_id,
        date: new Date(payment.created_at).toLocaleDateString(),
      }))}
    />
  )
}
