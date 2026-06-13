"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import Image from "next/image"
import { getSession, signIn } from "next-auth/react"
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react"

import MatrixLogo from "@/app/Assets/Matrix_logo.png"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const result = await signIn("credentials", { email, password, redirect: false })

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.")
        setIsSubmitting(false)
        return
      }

      const session = await getSession()
      const role = session?.user?.role

      if (role === "admin") { router.push("/admin/dashboard"); return }
      if (role === "student") { router.push("/student/dashboard"); return }
      if (role === "teacher") { router.push("/teacher/dashboard"); return }

      setError("Your account does not have access to a dashboard.")
      setIsSubmitting(false)
    } catch {
      setError("Login failed due to a network error. Please try again.")
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

        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          {/* Gradient header */}
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
            <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>
            <p className="mt-1 text-indigo-200 text-sm">Sign in to your Matrix Math Care account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form className="space-y-5" onSubmit={onSubmit}>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email address
                </label>
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

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
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
                <LogIn className="size-4" />
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
                  Create one for free
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Matrix Math Care &mdash; Online Coaching Platform
        </p>
      </div>
    </main>
  )
}
