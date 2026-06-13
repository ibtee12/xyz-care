import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { TeacherChatPanel } from "@/components/teacher/teacher-chat-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function TeacherChatPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "teacher") {
    redirect("/login")
  }

  const teacherId = session.user.id

  const enrollments = await db.enrollment.findMany({
    where: { course: { instructor_id: teacherId } },
    select: {
      student: {
        select: { id: true, name: true, roll_number: true },
      },
    },
  })

  // Deduplicate students
  const map = new Map<string, { id: string; name: string; roll_number: string | null }>()
  for (const row of enrollments) {
    map.set(row.student.id, row.student)
  }
  const uniqueStudents = [...map.values()]

  // Fetch last message timestamp for each student (teacher <-> student thread)
  const lastMessages = await db.chatMessage.findMany({
    where: {
      OR: [
        { sender_id: teacherId, recipient_id: { in: uniqueStudents.map((s) => s.id) } },
        { sender_id: { in: uniqueStudents.map((s) => s.id) }, recipient_id: teacherId },
      ],
    },
    orderBy: { created_at: "desc" },
    select: { sender_id: true, recipient_id: true, created_at: true },
  })

  // Build a map: studentId -> last message ISO string
  const lastMsgMap = new Map<string, string>()
  for (const msg of lastMessages) {
    const studentId = msg.sender_id === teacherId ? msg.recipient_id : msg.sender_id
    if (!lastMsgMap.has(studentId)) {
      lastMsgMap.set(studentId, msg.created_at.toISOString())
    }
  }

  const students = uniqueStudents
    .map((s) => ({ ...s, lastMessageAt: lastMsgMap.get(s.id) ?? null }))
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return a.name.localeCompare(b.name)
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Message students who are enrolled in at least one of your courses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Conversations sorted by most recent. Select a student to chat.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherChatPanel students={students} teacherId={teacherId} />
        </CardContent>
      </Card>
    </div>
  )
}
