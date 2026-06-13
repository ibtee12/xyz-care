import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import twilio from "twilio"

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
      phone: true,
      roll_number: true,
    },
  })

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No matching student recipients found." }, { status: 404 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromPhone) {
    return NextResponse.json(
      { error: "Twilio credentials are missing in environment variables." },
      { status: 500 }
    )
  }

  const client = twilio(accountSid, authToken)
  let sentCount = 0

  for (const recipient of recipients) {
    if (!recipient.phone) continue
    try {
      await client.messages.create({
        body: message,
        from: fromPhone,
        to: recipient.phone,
      })
      sentCount += 1
    } catch {
      // Continue sending to others even if one delivery fails.
    }
  }

  await db.notification.createMany({
    data: recipients.map((recipient) => ({
      recipient_id: recipient.id,
      type: "sms",
      message,
      is_read: false,
    })),
  })

  return NextResponse.json({
    recipients: recipients.length,
    sentCount,
  })
}
