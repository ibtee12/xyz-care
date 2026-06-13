import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 })
  }

  const count = await db.notification.count({
    where: { recipient_id: session.user.id, is_read: false },
  })

  return NextResponse.json({ count })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.notification.updateMany({
    where: { recipient_id: session.user.id, is_read: false },
    data: { is_read: true },
  })

  return NextResponse.json({ ok: true })
}
