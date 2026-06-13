import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Award } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { CertificateCard } from "./certificate-card"

export default async function StudentCertificatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "student") redirect("/login")

  const certificates = await db.certificate.findMany({
    where: { student_id: session.user.id },
    include: { course: { select: { title: true, instructor: { select: { name: true } } } } },
    orderBy: { issued_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">Your earned certificates of completion.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-50">
            <Award className="size-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No certificates yet</h3>
          <p className="mt-1 text-sm text-gray-400">Complete a course and your instructor will issue your certificate.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              studentName={session.user.name ?? "Student"}
              courseTitle={cert.course.title}
              instructorName={cert.course.instructor.name}
              certificateNo={cert.certificate_no}
              issuedAt={cert.issued_at.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
