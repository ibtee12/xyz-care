import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    totalPayments,
    recentPayments,
    topCourses,
    monthlyEnrollments,
  ] = await Promise.all([
    db.user.count({ where: { role: "student" } }),
    db.user.count({ where: { role: "teacher" } }),
    db.course.count(),
    db.enrollment.count(),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    db.payment.findMany({
      where: { status: "paid" },
      orderBy: { created_at: "desc" },
      take: 8,
      include: { student: { select: { name: true } } },
    }),
    db.course.findMany({
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { enrollments: true } } },
    }),
    db.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(enrolled_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM "Enrollment"
      WHERE enrolled_at >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `,
  ])

  return NextResponse.json({
    stats: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalPayments._sum.amount ?? 0,
    },
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      student: p.student.name,
      amount: p.amount,
      created_at: p.created_at,
    })),
    topCourses: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      enrollments: c._count.enrollments,
    })),
    monthlyEnrollments: monthlyEnrollments.map((r) => ({
      month: r.month,
      count: Number(r.count),
    })),
  })
}
