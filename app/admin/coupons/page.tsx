import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

import { CouponsManager } from "./coupons-manager"

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage discount coupons for students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
          <CardDescription>Create, update, and remove coupon rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsManager
            initialRows={coupons.map((coupon) => ({
              id: coupon.id,
              code: coupon.code,
              discountType: coupon.discount_type,
              discountValue: Number(coupon.discount_value),
              isActive: coupon.is_active,
              expiresAt: coupon.expires_at ? coupon.expires_at.toISOString().slice(0, 10) : "",
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
