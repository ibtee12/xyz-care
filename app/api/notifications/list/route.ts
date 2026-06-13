import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const notifications = await db.notification.findMany({
    where: { recipient_id: session.user.id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      type: true,
      message: true,
      link: true,
      is_read: true,
      created_at: true,
    },
  })

  return NextResponse.json({ notifications })
}
