"use client"

import { useState } from "react"
import { Award, Plus, CheckCircle2 } from "lucide-react"

type Cert = {
  id: string
  certificate_no: string
  issued_at: string
  student: { name: string; roll_number: string | null; email: string }
  course: { title: string }
}

type Student = { id: string; name: string; roll_number: string | null }
type Course = { id: string; title: string }

export function AdminCertificatesClient({
  certificates: initial,
  students,
  courses,
}: {
  certificates: Cert[]
  students: Student[]
  courses: Course[]
}) {
  const [certs, setCerts] = useState(initial)
  const [studentId, setStudentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [issuing, setIssuing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const issue = async () => {
    if (!studentId || !courseId) { setError("Select both student and course."); return }
    setIssuing(true); setError(""); setSuccess("")
    const res = await fetch("/api/admin/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? "Failed to issue."); setIssuing(false); return }
    setCerts((prev) => [
      {
        id: data.certificate.id,
        certificate_no: data.certificate.certificate_no,
        issued_at: data.certificate.issued_at,
        student: { name: data.certificate.student.name, roll_number: data.certificate.student.roll_number, email: "" },
        course: { title: data.certificate.course.title },
      },
      ...prev,
    ])
    setSuccess(`Certificate issued: ${data.certificate.certificate_no}`)
    setStudentId(""); setCourseId("")
    setIssuing(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">Issue completion certificates to enrolled students.</p>
      </div>

      {/* Issue form */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Award className="size-5 text-indigo-500" /> Issue New Certificate
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.roll_number ? ` (${s.roll_number})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        {success && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="size-4" />{success}
          </p>
        )}
        <button
          onClick={issue}
          disabled={issuing}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          <Plus className="size-4" /> {issuing ? "Issuing…" : "Issue Certificate"}
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-800">Issued Certificates ({certs.length})</h2>
        </div>
        {certs.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No certificates issued yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3 text-left">Certificate No.</th>
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-left">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-700">{c.certificate_no}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{c.student.name}</p>
                    {c.student.roll_number && <p className="text-xs text-gray-400">{c.student.roll_number}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{c.course.title}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(c.issued_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
