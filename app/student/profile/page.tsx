"use client"

import { useEffect, useState } from "react"
import { User, Mail, Phone, Hash, Save, CheckCircle2 } from "lucide-react"

import { Avatar } from "@/components/shared/avatar"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

type ProfilePayload = {
  user: { name: string; email: string; phone: string | null; roll_number: string | null }
}

export default function StudentProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error">("success")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/student/profile", { cache: "no-store" })
        const payload = (await res.json()) as ProfilePayload & { error?: string }
        if (!res.ok || !payload.user) {
          setStatus(payload.error ?? "Failed to load profile.")
          setStatusType("error")
        } else {
          setName(payload.user.name)
          setEmail(payload.user.email)
          setPhone(payload.user.phone ?? "")
          setRollNumber(payload.user.roll_number ?? "")
        }
      } catch {
        setStatus("Could not load profile.")
        setStatusType("error")
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  const onSave = async () => {
    setIsSubmitting(true)
    setStatus("")
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      const payload = (await res.json()) as ProfilePayload & { error?: string }
      if (!res.ok) {
        setStatus(payload.error ?? "Could not update profile.")
        setStatusType("error")
      } else {
        setStatus("Profile updated successfully.")
        setStatusType("success")
        setName(payload.user.name)
        setPhone(payload.user.phone ?? "")
      }
    } catch {
      setStatus("Network error.")
      setStatusType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">View and update your student profile details.</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Avatar card */}
        <div className="flex items-center gap-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 shadow-md text-white">
          <Avatar name={name || "Student"} size="xl" />
          <div>
            <p className="text-xl font-extrabold">{name || "—"}</p>
            <p className="text-sm text-indigo-200">{email}</p>
            {rollNumber ? <p className="mt-1 text-xs text-indigo-300">Roll: {rollNumber}</p> : null}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-5 text-lg font-bold text-gray-800">Edit information</h2>
          <div className="space-y-4">
            {[
              { id: "p-name", label: "Full name", icon: User, value: name, setter: setName, editable: true },
              { id: "p-email", label: "Email", icon: Mail, value: email, setter: () => {}, editable: false },
              { id: "p-roll", label: "Roll number", icon: Hash, value: rollNumber, setter: () => {}, editable: false },
              { id: "p-phone", label: "Phone", icon: Phone, value: phone, setter: setPhone, editable: true },
            ].map((f) => (
              <div key={f.id} className="space-y-1.5">
                <label htmlFor={f.id} className="text-sm font-semibold text-gray-700">
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id={f.id}
                    type="text"
                    value={f.value}
                    onChange={f.editable ? (e) => f.setter(e.target.value) : undefined}
                    disabled={!f.editable}
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition ${f.editable ? "border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" : "border-gray-100 bg-gray-50/60 text-gray-400 cursor-not-allowed"}`}
                  />
                </div>
              </div>
            ))}

            {status ? (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${statusType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {statusType === "success" ? <CheckCircle2 className="size-4" /> : null}
                {status}
              </div>
            ) : null}

            <button
              onClick={onSave}
              disabled={isLoading || isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Save className="size-4" />
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
