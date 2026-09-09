import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { AdminAppShell } from "@/components/admin/admin-app-shell"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") redirect("/login")

  return <AdminAppShell userName={session.user.name ?? "Admin"}>{children}</AdminAppShell>
}
