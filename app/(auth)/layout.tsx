import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === "student") {
    redirect("/student/dashboard")
  }

  if (session?.user?.role === "admin") {
    redirect("/admin/dashboard")
  }

  if (session?.user?.role === "teacher") {
    redirect("/teacher/dashboard")
  }

  return <>{children}</>
}
