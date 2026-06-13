import { NextResponse } from "next/server"

import { db } from "@/lib/db"

function normalizeStatus(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === "VALID" || normalized === "VALIDATED" || normalized === "SUCCESS") {
    return "success"
  }
  if (normalized === "FAILED" || normalized === "FAIL") {
    return "failed"
  }
  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "cancelled"
  }
  return "pending"
}

async function extractPayload(request: Request) {
  const url = new URL(request.url)
  const fromQuery = Object.fromEntries(url.searchParams.entries())

  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, string>
    return { ...fromQuery, ...json }
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData()
    return { ...fromQuery, ...Object.fromEntries(form.entries()) }
  }

  return fromQuery
}

async function handleWebhook(request: Request) {
  // Require a shared secret to prevent forged status updates
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret || request.headers.get("x-webhook-secret") !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await extractPayload(request)
  const txnId = String(payload.tran_id ?? payload.txn_id ?? "")
  const rawStatus = String(payload.status ?? payload.pay_status ?? "")
  const callbackMode = String(new URL(request.url).searchParams.get("status") ?? "").toUpperCase()

  if (!txnId) {
    return NextResponse.json({ error: "Missing transaction id." }, { status: 400 })
  }

  const payment = await db.payment.findUnique({
    where: { txn_id: txnId },
    select: { id: true },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 })
  }

  const mappedStatus = normalizeStatus(rawStatus)
  await db.payment.update({
    where: { id: payment.id },
    data: { status: mappedStatus },
  })

  if (callbackMode === "IPN") {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.redirect(new URL("/student/payments", request.url))
}

export async function GET(request: Request) {
  return handleWebhook(request)
}

export async function POST(request: Request) {
  return handleWebhook(request)
}
