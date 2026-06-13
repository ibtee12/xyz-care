import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import crypto from "crypto"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const certificates = await db.certificate.findMany({
    include: {
      student: { select: { name: true, roll_number: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { issued_at: "desc" },
  })

  return NextResponse.json({ certificates })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { studentId, courseId } = (await request.json()) as { studentId?: string; courseId?: string }

  if (!studentId || !courseId) {
    return NextResponse.json({ error: "studentId and courseId are required." }, { status: 400 })
  }

  const enrollment = await db.enrollment.findUnique({
    where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    select: { id: true },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "Student is not enrolled in this course." }, { status: 400 })
  }

  const existing = await db.certificate.findUnique({
    where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: "Certificate already issued for this student and course." }, { status: 409 })
  }

  const certificate_no = `CERT-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  const cert = await db.certificate.create({
    data: { student_id: studentId, course_id: courseId, certificate_no },
    include: {
      student: { select: { name: true, roll_number: true } },
      course: { select: { title: true } },
    },
  })

  return NextResponse.json({ certificate: cert }, { status: 201 })
}
