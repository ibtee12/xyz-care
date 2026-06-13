import { Bell, Send } from "lucide-react"

import { NotificationSender } from "./sender"

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send SMS, email, or website notifications to all students or a specific roll number.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
            <Bell className="size-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Send Notification</p>
            <p className="text-xs text-gray-400">Every send is saved to the notifications table</p>
          </div>
          <Send className="ml-auto size-5 text-indigo-400" />
        </div>
        <NotificationSender />
      </div>
    </div>
  )
}
