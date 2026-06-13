import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  CreditCard,
  Bell,
  MessageSquare,
  User,
  Globe,
  MessageCircle,
  Bookmark,
  Award,
  Brain,
} from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { Avatar } from "@/components/shared/avatar"
import { NotificationBadge } from "@/components/shared/notification-bell"
import { authOptions } from "@/lib/auth"

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/marks", label: "My Marks", icon: BarChart3 },
  { href: "/student/payments", label: "Payments", icon: CreditCard },
  { href: "/student/quizzes", label: "Quizzes", icon: Brain },
  { href: "/student/forum", label: "Forum", icon: MessageCircle },
  { href: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/chat", label: "Chat", icon: MessageSquare },
  { href: "/student/profile", label: "Profile", icon: User },
]

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "student") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top bar for public links */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-indigo-100 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur md:px-6">
        <nav className="flex items-center gap-1">
          {publicLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Globe className="size-3" />
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/student/dashboard"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
        >
          Your Portal
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 py-0 lg:gap-6 lg:px-6 lg:py-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl bg-gradient-to-b from-indigo-700 to-violet-800 p-5 text-white shadow-lg">
            {/* Student info */}
            <div className="mb-6 flex items-center gap-3">
              <Avatar name={session.user.name ?? "Student"} size="md" />
              <div className="min-w-0">
                <p className="truncate font-bold">{session.user.name}</p>
                <p className="text-xs text-indigo-200">
                  {session.user.roll_number ? `Roll: ${session.user.roll_number}` : "Student"}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {studentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-100 transition-all hover:bg-white/20 hover:text-white"
                >
                  <link.icon className="size-4 shrink-0" />
                  {link.label}
                  {link.href === "/student/notifications" && <NotificationBadge />}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-6 border-t border-white/20 pt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-100 bg-white px-2 py-2 lg:hidden">
          {studentLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 rounded-xl p-2 text-gray-400 hover:text-indigo-600"
            >
              <link.icon className="size-5" />
              <span className="text-[10px] font-medium">{link.label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 lg:px-0 lg:pb-0 lg:pt-0">{children}</main>
      </div>
    </div>
  )
}
