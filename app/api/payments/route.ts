import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [payments, enrollments] = await Promise.all([
    db.payment.findMany({
      where: { student_id: session.user.id },
      orderBy: { created_at: "desc" },
    }),
    db.enrollment.findMany({
      where: { student_id: session.user.id },
      include: {
        course: {
          select: { price: true },
        },
      },
    }),
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

  return NextResponse.json({
    payments,
    summary: {
      totalPaid,
      pendingFees,
      totalFees,
    },
  })
}
