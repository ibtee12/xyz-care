"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Video,
  Bell,
  MessageSquare,
  Globe,
  Menu,
  X,
} from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { Avatar } from "@/components/shared/avatar"
import { cn } from "@/lib/utils"

const teacherLinks = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/courses", label: "My Courses", icon: BookOpen },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/marks", label: "Marks", icon: BarChart3 },
  { href: "/teacher/live-classes", label: "Live Classes", icon: Video },
  { href: "/teacher/notifications", label: "Notifications", icon: Bell },
  { href: "/teacher/chat", label: "Chat", icon: MessageSquare },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/teacher/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Sidebar({ userName, onClose }: { userName: string; onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-cyan-700 to-teal-800 text-white">
      {/* Profile */}
      <div className="flex items-center gap-3 border-b border-white/20 px-5 py-5">
        <Avatar name={userName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{userName}</p>
          <p className="text-xs text-teal-200">Teacher</p>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="ml-auto rounded-lg p-1 hover:bg-white/10">
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {teacherLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive(pathname, link.href)
                ? "bg-white/20 text-white shadow-sm"
                : "text-teal-100 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Public links + logout */}
      <div className="border-t border-white/20 px-3 py-4 space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-teal-200 hover:bg-white/10 hover:text-white"
        >
          <Globe className="size-4" />
          Homepage
        </Link>
        <Link
          href="/courses"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-teal-200 hover:bg-white/10 hover:text-white"
        >
          <BookOpen className="size-4" />
          Public Courses
        </Link>
        <LogoutButton />
      </div>
    </div>
  )
}

export function TeacherAppShell({
  userName,
  children,
}: Readonly<{ userName: string; children: React.ReactNode }>) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const activeLink = teacherLinks.find((l) => isActive(pathname, l.href))

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
        <p className="text-sm font-bold text-gray-700">{activeLink?.label ?? "Teacher Portal"}</p>
        <Avatar name={userName} size="sm" />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar userName={userName} onClose={() => setMobileOpen(false)} />
      </aside>

      <div className="mx-auto flex w-full max-w-7xl lg:gap-6 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)] overflow-hidden rounded-2xl shadow-lg">
            <Sidebar userName={userName} />
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-5 lg:px-0 lg:py-0">{children}</main>
      </div>
    </div>
  )
}
