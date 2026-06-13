import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"

import MatrixLogo from "@/app/Assets/Matrix_logo.png"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const portalLinks = [
  { href: "/login", label: "Student Login" },
  { href: "/register", label: "Register" },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        {/* Brand */}
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <div className="relative size-10 flex-shrink-0 rounded-xl bg-white p-1.5 shadow-sm">
              <Image 
                src={MatrixLogo} 
                alt="Matrix Logo" 
                fill
                className="object-contain p-1.5" 
                sizes="40px"
              />
            </div>
            Matrix Math Care
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-gray-400">
            Modern online coaching for ambitious students. Learn through structured courses, track
            your progress, and achieve measurable results.
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-indigo-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {portalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-indigo-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <Mail className="mt-0.5 size-4 shrink-0 text-indigo-400" />
              support@matrixmathcare.com
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <Phone className="mt-0.5 size-4 shrink-0 text-indigo-400" />
              +880 1700 000000
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-400">
              <MapPin className="mt-0.5 size-4 shrink-0 text-indigo-400" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Matrix Math Care. All rights reserved.
      </div>
    </footer>
  )
}
