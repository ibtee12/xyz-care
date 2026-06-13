import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type CreateCouponBody = {
  code?: string
  discount_type?: string
  discount_value?: number
  max_uses?: number | null
  expires_at?: string | null
  is_active?: boolean
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const coupons = await db.coupon.findMany({
    orderBy: { created_at: "desc" },
  })
  return NextResponse.json({ coupons })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as CreateCouponBody
  const code = body.code?.trim().toUpperCase()
  const discountType = body.discount_type?.trim()
  const discountValue = Number(body.discount_value ?? 0)

  if (!code || !discountType || !Number.isFinite(discountValue) || discountValue <= 0) {
    return NextResponse.json(
      { error: "code, discount_type and valid discount_value are required." },
      { status: 400 }
    )
  }

  const existing = await db.coupon.findUnique({ where: { code }, select: { id: true } })
  if (existing) {
    return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 })
  }

  const coupon = await db.coupon.create({
    data: {
      code,
      discount_type: discountType,
      discount_value: discountValue,
      max_uses: body.max_uses ?? null,
      expires_at: body.expires_at ? new Date(body.expires_at) : null,
      is_active: body.is_active ?? true,
    },
  })

  return NextResponse.json({ coupon }, { status: 201 })
}
