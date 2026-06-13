import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AdminCertificatesClient } from "./certificates-client"

export default async function AdminCertificatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  const [certificates, students, courses] = await Promise.all([
    db.certificate.findMany({
      include: {
        student: { select: { name: true, roll_number: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { issued_at: "desc" },
    }),
    db.user.findMany({
      where: { role: "student" },
      select: { id: true, name: true, roll_number: true },
      orderBy: { name: "asc" },
    }),
    db.course.findMany({
      where: { is_published: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ])

  return (
    <AdminCertificatesClient
      certificates={certificates.map((c) => ({
        id: c.id,
        certificate_no: c.certificate_no,
        issued_at: c.issued_at.toISOString(),
        student: { name: c.student.name, roll_number: c.student.roll_number, email: c.student.email },
        course: { title: c.course.title },
      }))}
      students={students.map((s) => ({ id: s.id, name: s.name, roll_number: s.roll_number }))}
      courses={courses}
    />
  )
}
