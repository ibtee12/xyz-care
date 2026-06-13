import { Target, Eye, Heart, CheckCircle2 } from "lucide-react"

import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    body: "Make high-quality coaching accessible and measurable for every student in Bangladesh.",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    icon: Eye,
    title: "Our Vision",
    body: "Build a learning ecosystem where students confidently reach their highest potential.",
    color: "from-cyan-500 to-teal-500",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    icon: Heart,
    title: "Our Promise",
    body: "Structured lessons, practical assessments, and transparent outcomes for every learner.",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
]

const strengths = [
  "Student-first coaching with practical study plans",
  "Continuous progress tracking through exam performance",
  "Role-based platform for smooth student and admin workflows",
  "Live classes and direct teacher communication",
  "Secure payment integration with SSLCommerz",
  "SMS and email notifications to keep students informed",
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">About Matrix Math Care</h1>
          <p className="mt-4 max-w-2xl mx-auto text-indigo-200 text-lg">
            An online coaching platform built to help students learn with clarity, stay consistent,
            and improve through data-backed feedback.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:px-6">
        {/* Pillars */}
        <section className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center"
            >
              <div className={`mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${p.bg}`}>
                <p.icon className={`size-7 ${p.text}`} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-800">{p.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{p.body}</p>
            </div>
          ))}
        </section>

        {/* What sets us apart */}
        <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white md:p-12">
          <h2 className="mb-8 text-3xl font-extrabold">Why Matrix Math Care stands out</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map((s) => (
              <div key={s} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cyan-300" />
                <p className="text-sm leading-relaxed text-indigo-100">{s}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
