import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { BookOpen, Menu } from "lucide-react"

import MatrixLogo from "@/app/Assets/Matrix_logo.png"

import { authOptions } from "@/lib/auth"

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const dashboardByRole = {
  student: "/student/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
} as const

const portalLabel = {
  student: "Your Portal",
  admin: "Admin Panel",
  teacher: "Your Portal",
} as const

export async function Navbar() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const dashboardHref = role ? dashboardByRole[role] : null
  const portalText = role ? portalLabel[role] : null

  return (
    <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-700">
          <div className="relative size-8 flex-shrink-0">
            <Image 
              src={MatrixLogo} 
              alt="Matrix Logo" 
              fill
              className="object-contain" 
              sizes="32px"
            />
          </div>
          <span className="hidden sm:inline">Matrix Math Care</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              {portalText}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile hamburger placeholder — could extend with a client component */}
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 md:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-indigo-50 bg-white px-4 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {link.label}
          </Link>
        ))}
        <BookOpen className="ml-auto size-4 shrink-0 text-indigo-300" />
      </div>
    </header>
  )
}
