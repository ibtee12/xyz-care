import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { 
  BookOpen, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Layers, 
  User, 
  PlayCircle,
  Clock,
  ShieldCheck,
  Globe,
  Lock
} from "lucide-react"

import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

type PageProps = { params: Promise<{ slug: string }> }

export default async function CourseDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const isStudent = session?.user?.role === "student"
  const { slug } = await params

  const course = await db.course.findUnique({
    where: { slug, is_published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      course_type: true,
      location: true,
      schedule: true,
      batch: true,
      instructor: { select: { name: true } },
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  })

  if (!course) {
    notFound()
  }

  const isOffline = course.course_type === "offline"

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className={`relative py-20 overflow-hidden ${isOffline ? "bg-amber-50/50" : "bg-indigo-50/50"}`}>
        <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  isOffline ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                }`}>
                  {course.course_type} Course
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <User className="size-3" /> {course._count.enrollments} Students Enrolled
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-6xl leading-[1.1]">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl">
                {course.description ?? "Master this subject with expert guidance and high-quality course materials designed for your success."}
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center text-indigo-600 font-black text-xl">
                    {course.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Instructor</p>
                    <p className="text-base font-bold text-gray-900 leading-none">{course.instructor.name}</p>
                  </div>
                </div>
                {isOffline && (
                  <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                    <div className="size-12 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center text-amber-600">
                      <MapPin className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Location</p>
                      <p className="text-base font-bold text-gray-900 leading-none">{course.location || "Venue TBA"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-[40px] bg-white shadow-2xl ring-1 ring-gray-100 p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Tuition Fee</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">One-time Payment</span>
                  </div>
                  <div className="text-5xl font-black text-gray-900">
                    ৳{Number(course.price).toLocaleString("en-BD")}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <CheckCircle2 className="size-5 text-emerald-500" /> Lifetime access to materials
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <CheckCircle2 className="size-5 text-emerald-500" /> Certificate upon completion
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <CheckCircle2 className="size-5 text-emerald-500" /> Dedicated support group
                  </div>
                </div>

                <Button className={`w-full h-16 rounded-[24px] text-lg font-black shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                  isOffline 
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" 
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`} asChild>
                  <Link href={isStudent ? `/student/payments?courseId=${course.id}` : "/register"}>
                    Enroll in Program
                  </Link>
                </Button>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 size-24 bg-indigo-100 rounded-full blur-2xl opacity-50" />
              <div className="absolute -bottom-10 -left-10 size-40 bg-amber-100 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <main className="container mx-auto max-w-7xl px-4 py-24 md:px-6">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-16">
            {/* Overview */}
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Program Overview</h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <p>
                  This course is meticulously structured to take you from foundational concepts to advanced mastery. 
                  Whether you are a beginner or looking to sharpen your professional skills, our expert-led sessions 
                  ensure a deep understanding of every module.
                </p>
                <p>
                  {course.description}
                </p>
              </div>
            </section>

            {/* Curriculum / Schedule */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {isOffline ? "Class Schedule" : "Curriculum"}
                </h2>
                {!isOffline && (
                  <span className="text-sm font-bold text-gray-400">{course.lessons.length} Modules</span>
                )}
              </div>

              {isOffline ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl bg-gray-50 p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                        <Calendar className="size-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Regular Classes</p>
                        <p className="text-lg font-bold text-gray-900">{course.schedule || "To be updated"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                        <Layers className="size-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Batch</p>
                        <p className="text-lg font-bold text-gray-900">{course.batch || "Batch 01"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border-2 border-dashed border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                    <div className="rounded-2xl bg-gray-50 p-4 mb-4 text-gray-400">
                      <MapPin className="size-8" />
                    </div>
                    <p className="font-bold text-gray-900">Physical Venue</p>
                    <p className="text-sm text-gray-500 mt-1">{course.location || "Location shared upon enrollment"}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.lessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      className="group flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all ring-1 ring-inset ring-transparent hover:ring-indigo-100"
                    >
                      <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <PlayCircle className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Module {lesson.order}</span>
                          {lesson.duration && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-300">
                              <Clock className="size-3" /> {Math.floor(lesson.duration / 60)} MINS
                            </span>
                          )}
                        </div>
                      </div>
                      <Lock className="size-4 text-gray-200" />
                    </div>
                  ))}
                  {course.lessons.length === 0 && (
                    <div className="p-12 text-center rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200">
                      <PlayCircle className="size-12 mx-auto mb-4 text-gray-300 opacity-20" />
                      <p className="text-sm font-bold text-gray-400">Recorded lessons are being prepared.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[32px] bg-gray-900 p-8 text-white space-y-6">
              <h4 className="text-xl font-bold tracking-tight">Why learn with us?</h4>
              <ul className="space-y-4">
                {[
                  { icon: ShieldCheck, text: "Verified Expert Instructors" },
                  { icon: Globe, text: "Community Support Access" },
                  { icon: BookOpen, text: "Structured Learning Path" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <item.icon className="size-5 text-indigo-400" /> {item.text}
                  </li>
                ))}
              </ul>
              <div className="h-px bg-white/10" />
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Instructor</p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                    {course.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{course.instructor.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">Senior Specialist</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-[32px] bg-indigo-50 border border-indigo-100">
              <h4 className="text-lg font-bold text-indigo-900 mb-2">Need Help?</h4>
              <p className="text-sm text-indigo-700/70 mb-4 font-medium">
                Our support team is available 24/7 to answer your questions regarding enrollment or program details.
              </p>
              <Button variant="link" className="h-auto p-0 text-indigo-600 font-bold">
                Chat with an expert →
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
