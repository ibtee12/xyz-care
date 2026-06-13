import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Bell } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function TeacherNotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") redirect("/login")

  const notifications = await db.notification.findMany({
    where: { recipient_id: session.user.id },
    orderBy: { created_at: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Messages sent to your account.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <EmptyState icon={Bell} title="No notifications" description="Notifications from the admin will appear here." />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ${n.is_read ? "ring-gray-100" : "ring-teal-200"}`}
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${n.is_read ? "bg-gray-50" : "bg-teal-50"}`}>
                <Bell className={`size-4 ${n.is_read ? "text-gray-400" : "text-teal-500"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                    {n.type}
                  </span>
                  {!n.is_read ? <span className="size-2 rounded-full bg-teal-500" /> : null}
                </div>
                <p className="mt-1.5 text-sm text-gray-700">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
