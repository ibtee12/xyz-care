import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type UpdateProfileBody = {
  name?: string
  phone?: string
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      roll_number: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as UpdateProfileBody
  const name = body.name?.trim()
  const phone = body.phone?.trim() || null

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      roll_number: true,
    },
  })

  return NextResponse.json({ user })
}
