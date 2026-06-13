import Link from "next/link"
import { getServerSession } from "next-auth"
import {
  BookOpen,
  BarChart3,
  Shield,
  Star,
  ChevronRight,
  Users,
  Award,
  Zap,
  CheckCircle2,
} from "lucide-react"

import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { TeacherCarousel } from "@/components/hero/teacher-carousel"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import TeacherMath from "@/app/Assets/teacher_math.jpg"
import TeacherPhysics from "@/app/Assets/teacher_physics.png"
import TeacherChemistry from "@/app/Assets/teacher_chemistry.png"
import TeacherEnglish from "@/app/Assets/teacher_english.png"

const heroTeachers = [
  {
    name: "Kawsar Hossain Kanak",
    subject: "Mathematics",
    photo: TeacherMath,
    accent: "from-cyan-400 to-indigo-500",
  },
  {
    name: "Dr. Rafiq Ahmed",
    subject: "Physics",
    photo: TeacherPhysics,
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Tanvir Hasan",
    subject: "Chemistry",
    photo: TeacherChemistry,
    accent: "from-emerald-400 to-teal-500",
  },
  {
    name: "Fatima Sultana",
    subject: "English",
    photo: TeacherEnglish,
    accent: "from-rose-400 to-pink-500",
  },
]

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Organized lessons with clear learning paths tailored to your academic goals.",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your marks, compare with top scores, and identify improvement areas.",
    color: "from-cyan-500 to-teal-500",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    icon: Shield,
    title: "Admin-led Quality",
    description: "Transparent exam workflows and progress updates managed by experienced admins.",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    icon: Zap,
    title: "Live Classes",
    description: "Join interactive live sessions and stay connected with your instructors.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
]

const testimonials = [
  {
    name: "Nafisa Rahman",
    role: "HSC Student",
    text: "Matrix Math Care helped me stay consistent. My weekly test scores improved noticeably within two months.",
    initials: "NR",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Tahmid Hasan",
    role: "University Student",
    text: "The dashboard is simple and clear. I can always see where I stand in each exam.",
    initials: "TH",
    color: "from-cyan-500 to-teal-500",
  },
  {
    name: "Afsana Kabir",
    role: "Medical Aspirant",
    text: "Teachers are supportive and the feedback after each test is very useful for revision.",
    initials: "AK",
    color: "from-emerald-500 to-green-500",
  },
]

const faqs = [
  {
    question: "Who can enroll in Matrix Math Care?",
    answer: "Any student can register and start learning with our curated courses and tests.",
  },
  {
    question: "How do I view my exam results?",
    answer:
      "After login, go to My Marks in your dashboard to see all exam results with highest scores.",
  },
  {
    question: "Can I contact support before enrolling?",
    answer: "Yes, use the Contact page to send questions. Our team responds within 24 hours.",
  },
]

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const enrollHref = session?.user?.role === "student" ? "/student/payments" : "/register"

  const [studentCount, courseCount, examCount, highlightedCourses] = await Promise.all([
    db.user.count({ where: { role: "student" } }),
    db.course.count({ where: { is_published: true } }),
    db.exam.count(),
    db.course.findMany({
      where: { is_published: true },
      select: { id: true, title: true, description: true, price: true, slug: true, instructor: { select: { name: true } } },
      take: 3,
      orderBy: { created_at: "desc" },
    }),
  ])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        {/* Subtle background blobs */}
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          {/* Main grid */}
          <div className="grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24 lg:py-28">
            {/* Left — Copy */}
            <div className="order-2 md:order-1">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                <Star className="size-3.5 fill-amber-300 text-amber-300" />
                Bangladesh&apos;s trusted coaching platform
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
                Learn Smarter.
                <br />
                <span className="text-cyan-300">Score Higher.</span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-indigo-100/90 md:text-lg">
                Matrix Math Care delivers structured courses, live classes, and
                transparent exam analytics — so every student can track and achieve
                real progress.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={enrollHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition-all hover:shadow-xl hover:scale-[1.03]"
                >
                  Get Started Free
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Right — Teacher Carousel */}
            <div className="order-1 flex justify-center md:order-2 md:justify-end">
              <TeacherCarousel teachers={heroTeachers} />
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-white/15 py-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: studentCount.toLocaleString(), label: "Students", icon: Users, color: "text-cyan-300" },
                { value: courseCount.toString(), label: "Courses", icon: BookOpen, color: "text-amber-300" },
                { value: examCount.toString(), label: "Exams", icon: Award, color: "text-emerald-300" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-center gap-3">
                  <stat.icon className={`size-6 ${stat.color} hidden sm:block`} />
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-extrabold text-white md:text-2xl">{stat.value}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-200">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Everything you need to excel
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Built for students who want to learn with clarity and measure real results.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className={`size-6 ${f.text}`} />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-800">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Courses ── */}
      <section className="bg-gradient-to-b from-indigo-50/60 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Course Highlights
              </h2>
              <p className="mt-2 text-gray-500">Our latest and most popular courses.</p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              View all courses
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {highlightedCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200 py-14 text-center text-gray-400">
              Courses will be published soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {highlightedCourses.map((course, idx) => {
                const gradients = [
                  "from-indigo-500 to-violet-500",
                  "from-cyan-500 to-teal-500",
                  "from-emerald-500 to-green-500",
                ]
                return (
                  <div
                    key={course.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className={`h-3 bg-gradient-to-r ${gradients[idx % 3]}`} />
                    <div className="p-6">
                      <h3 className="mb-1 text-lg font-bold text-gray-800">{course.title}</h3>
                      <p className="mb-4 text-sm text-gray-500 line-clamp-2">
                        {course.description ?? "Comprehensive learning experience."}
                      </p>
                      <p className="mb-1 text-xs text-gray-400">
                        by {course.instructor.name}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                          BDT {Number(course.price).toLocaleString("en-BD")}
                        </span>
                        <Link
                          href={`/courses#${course.slug}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                        >
                          Enroll
                          <ChevronRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            What students say
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-500">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-indigo-50/60 py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-indigo-500" />
                  <div>
                    <p className="mb-2 font-semibold text-gray-800">{faq.question}</p>
                    <p className="text-sm text-gray-500">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 py-16 text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-white">Ready to start learning?</h2>
        <p className="mb-8 text-indigo-100">
          Join hundreds of students already improving their scores with Matrix Math Care.
        </p>
        <Link
          href={enrollHref}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Create Free Account
          <ChevronRight className="size-5" />
        </Link>
      </section>

      <Footer />
    </div>
  )
}
