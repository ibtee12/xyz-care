"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  CreditCard,
  Bell,
  Tag,
  Menu,
  X,
  Shield,
  Newspaper,
  Award,
  Brain,
  TrendingUp,
} from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { Avatar } from "@/components/shared/avatar"
import { cn } from "@/lib/utils"

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/marks", label: "Marks", icon: BarChart3 },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/quizzes", label: "Quizzes", icon: Brain },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/reports", label: "Reports", icon: TrendingUp },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarContent({ userName, onClose }: { userName: string; onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-indigo-800 to-violet-900 text-white">
      <div className="flex items-center gap-3 border-b border-white/20 px-5 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Shield className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{userName}</p>
          <span className="rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-200">
            ADMIN
          </span>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="ml-auto rounded-lg p-1 hover:bg-white/10">
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive(pathname, link.href)
                ? "bg-white/20 text-white shadow-sm"
                : "text-indigo-200 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/20 px-3 py-4">
        <LogoutButton />
      </div>
    </div>
  )
}

export function AdminAppShell({
  userName,
  children,
}: {
  userName: string
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const activeLink = adminLinks.find((l) => isActive(pathname, l.href))

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <Menu className="size-4" />
        </button>
        <p className="text-sm font-bold text-gray-700">{activeLink?.label ?? "Admin Panel"}</p>
        <Avatar name={userName} size="sm" />
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent userName={userName} onClose={() => setMobileOpen(false)} />
      </aside>

      <div className="mx-auto flex w-full max-w-7xl lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)] overflow-hidden rounded-2xl shadow-lg">
            <SidebarContent userName={userName} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-5 lg:px-0 lg:py-0">{children}</main>
      </div>
    </div>
  )
}
