import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Resend } from "resend"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type NotificationBody = {
  message?: string
  target?: "all" | "roll"
  rollNumber?: string
  subject?: string
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as NotificationBody
  const message = body.message?.trim()
  const subject = body.subject?.trim() || "Matrix Math Care Notification"
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
      email: true,
    },
  })

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No matching student recipients found." }, { status: 404 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!resendApiKey || !fromEmail) {
    return NextResponse.json(
      { error: "Resend credentials are missing in environment variables." },
      { status: 500 }
    )
  }

  const resend = new Resend(resendApiKey)
  let sentCount = 0

  for (const recipient of recipients) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject,
        text: message,
      })
      sentCount += 1
    } catch {
      // Continue sending to others even if one delivery fails.
    }
  }

  await db.notification.createMany({
    data: recipients.map((recipient) => ({
      recipient_id: recipient.id,
      type: "email",
      message,
      is_read: false,
    })),
  })

  return NextResponse.json({
    recipients: recipients.length,
    sentCount,
  })
}
