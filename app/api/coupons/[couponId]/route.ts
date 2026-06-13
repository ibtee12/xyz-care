import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type UpdateCouponBody = {
  code?: string
  discount_type?: string
  discount_value?: number
  max_uses?: number | null
  expires_at?: string | null
  is_active?: boolean
}

type RouteParams = {
  params: Promise<{ couponId: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { couponId } = await params
  const body = (await request.json()) as UpdateCouponBody
  const nextCode = body.code?.trim().toUpperCase()

  const existing = await db.coupon.findUnique({
    where: { id: couponId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 })
  }

  if (nextCode) {
    const codeConflict = await db.coupon.findFirst({
      where: {
        code: nextCode,
        NOT: { id: couponId },
      },
      select: { id: true },
    })
    if (codeConflict) {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 })
    }
  }

  const coupon = await db.coupon.update({
    where: { id: couponId },
    data: {
      code: nextCode,
      discount_type: body.discount_type?.trim(),
      discount_value:
        body.discount_value === undefined ? undefined : Number(body.discount_value),
      max_uses: body.max_uses === undefined ? undefined : body.max_uses,
      expires_at:
        body.expires_at === undefined
          ? undefined
          : body.expires_at
            ? new Date(body.expires_at)
            : null,
      is_active: body.is_active,
    },
  })

  return NextResponse.json({ coupon })
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { couponId } = await params
  const existing = await db.coupon.findUnique({
    where: { id: couponId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 })
  }

  await db.coupon.delete({ where: { id: couponId } })
  return NextResponse.json({ success: true })
}
