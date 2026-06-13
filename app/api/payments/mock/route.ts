import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import crypto from "crypto"


import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type MockPaymentBody = {
  amount?: number
  courseId?: string
  cardNumber?: string
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as MockPaymentBody
  const amount = Number(body.amount ?? 0)
  const courseId = body.courseId?.trim()
  const cardNumber = String(body.cardNumber ?? "").replace(/\s/g, "")

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Valid payment amount is required." }, { status: 400 })
  }

  // Accept any 16-digit card number
  if (!/^\d{16}$/.test(cardNumber)) {
    return NextResponse.json({ error: "Card number must be exactly 16 digits." }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  if (courseId) {
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Selected course not found." }, { status: 404 })
    }

    // Automatically enroll the student
    await db.enrollment.upsert({
      where: {
        student_id_course_id: {
          student_id: user.id,
          course_id: courseId,
        },
      },
      update: {},
      create: {
        student_id: user.id,
        course_id: courseId,
      },
    })
  }


  // Generate a fake transaction ID
  const txnId = `MOCK-${crypto.randomUUID().split("-")[0].toUpperCase()}-${Date.now()}`

  // Create the payment record as immediately paid
  const payment = await db.payment.create({
    data: {
      student_id: user.id,
      amount,
      method: "Card",
      status: "paid",
      txn_id: txnId,
    },
  })

  return NextResponse.json({
    success: true,
    paymentId: payment.id,
    txnId: payment.txn_id,
    message: "Payment successful!",
  })
}
