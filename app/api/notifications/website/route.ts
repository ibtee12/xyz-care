import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type NotificationBody = {
  message?: string
  target?: "all" | "roll"
  rollNumber?: string
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as NotificationBody
  const message = body.message?.trim()
  const target = body.target ?? "all"
  const rollNumber = body.rollNumber?.trim()

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 })
  }
  if (target === "roll" && !rollNumber) {
    return NextResponse.json({ error: "Roll number is required." }, { status: 400 })
  }

  const recipients = await db.user.findMany({
    where: {
      role: "student",
      ...(target === "roll" ? { roll_number: rollNumber } : {}),
    },
    select: {
      id: true,
    },
  })

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No matching student recipients found." }, { status: 404 })
  }

  // Save directly to notifications table — students see these on their portal
  await db.notification.createMany({
    data: recipients.map((recipient) => ({
      recipient_id: recipient.id,
      type: "website",
      message,
      is_read: false,
    })),
  })

  return NextResponse.json({
    recipients: recipients.length,
    sentCount: recipients.length,
  })
}
