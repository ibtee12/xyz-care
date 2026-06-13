"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import Image from "next/image"
import { ArrowLeft, BookOpen, Building2, Check, Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from "lucide-react"

import MatrixLogo from "@/app/Assets/Matrix_logo.png"

import { SearchableSelect } from "@/components/ui/searchable-select"
import { bdInstitutions } from "@/lib/bd-institutions"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [institution, setInstitution] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [generatedId, setGeneratedId] = useState("")

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      if (!classLevel || !institution) {
        setError("Please select your class and institution.")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, classLevel, institution }),
      })
      const payload = (await response.json()) as { error?: string; user?: { roll_number: string } }
      if (!response.ok) {
        setError(payload.error ?? "Registration failed. Try again.")
        setIsSubmitting(false)
        return
      }

      if (payload.user?.roll_number) {
        setGeneratedId(payload.user.roll_number)
        setShowModal(true)
      } else {
        router.push("/login")
      }
    } catch {
      setError("Registration failed due to a network error.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-8 text-center">
            <div className="mx-auto mb-4 relative size-16 flex-shrink-0 rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <Image
                src={MatrixLogo}
                alt="Matrix Logo"
                fill
                className="object-contain p-2"
                sizes="64px"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Create account</h1>
            <p className="mt-1 text-sm text-indigo-200">Join Matrix Math Care as a student</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Full name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Password with toggle */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Class */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Class</label>
                <SearchableSelect
                  options={[
                    "Class 9",
                    "Class 10",
                    "HSC 1st Year",
                    "HSC 2nd Year",
                    "Admission (Medical)",
                    "Admission (Varsity)",
                    "Admission (Engineering)",
                  ]}
                  value={classLevel}
                  onChange={(val) => setClassLevel(val)}
                  placeholder="Select your class..."
                  icon={BookOpen}
                />
              </div>

              {/* Institution */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Institution (School/College)</label>
                <SearchableSelect
                  options={bdInstitutions}
                  value={institution}
                  onChange={(val) => setInstitution(val)}
                  placeholder="Search your institution..."
                  icon={Building2}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
              >
                <UserPlus className="size-4" />
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Matrix Math Care &mdash; Online Coaching Platform
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-2xl ring-1 ring-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Check className="size-8" />
              </div>
              <h2 className="text-xl font-extrabold">Welcome!</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 font-medium">Your account was created successfully.</p>
              <div className="mt-6 rounded-2xl bg-indigo-50 border border-indigo-100 py-5">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Your MatrixID</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-indigo-900">{generatedId}</p>
              </div>
              <p className="mt-4 text-xs text-gray-500">Please save this ID, it is your unique identifier.</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
