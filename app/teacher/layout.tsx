import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { TeacherAppShell } from "@/components/teacher/teacher-app-shell"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "teacher") {
    redirect("/login")
  }

  return <TeacherAppShell userName={session.user.name ?? "Teacher"}>{children}</TeacherAppShell>
}
