"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Plus, Tag, CheckCircle2, XCircle, Trash2, Save } from "lucide-react"

type CouponRow = {
  id: string
  code: string
  discountType: string
  discountValue: number
  isActive: boolean
  expiresAt: string
}

export function CouponsManager({ initialRows }: { initialRows: CouponRow[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [status, setStatus] = useState("")
  const [isErr, setIsErr] = useState(false)
  const [form, setForm] = useState({ code: "", discountType: "percentage", discountValue: "", expiresAt: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: form.code, discount_type: form.discountType, discount_value: Number(form.discountValue), expires_at: form.expiresAt || null, is_active: true }),
      })
      const p = (await res.json()) as { error?: string }
      if (!res.ok) { setStatus(p.error ?? "Failed to create coupon."); setIsErr(true); return }
      setForm({ code: "", discountType: "percentage", discountValue: "", expiresAt: "" })
      setStatus("Coupon created.")
      setIsErr(false)
      router.refresh()
    } catch {
      setStatus("Network error.")
      setIsErr(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateCoupon = async (row: CouponRow) => {
    setStatus("")
    try {
      const res = await fetch(`/api/coupons/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: row.code, discount_type: row.discountType, discount_value: row.discountValue, expires_at: row.expiresAt || null, is_active: row.isActive }),
      })
      const p = (await res.json()) as { error?: string }
      if (!res.ok) { setStatus(p.error ?? "Failed to update."); setIsErr(true); return }
      setStatus(`Updated ${row.code}.`); setIsErr(false)
      router.refresh()
    } catch {
      setStatus("Network error."); setIsErr(true)
    }
  }

  const deleteCoupon = async (id: string) => {
    setStatus("")
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" })
      const p = (await res.json()) as { error?: string }
      if (!res.ok) { setStatus(p.error ?? "Failed to delete."); setIsErr(true); return }
      setRows((prev) => prev.filter((r) => r.id !== id))
      setStatus("Deleted."); setIsErr(false)
      router.refresh()
    } catch {
      setStatus("Network error."); setIsErr(true)
    }
  }

  const field = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-100"

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={createCoupon} className="rounded-2xl bg-indigo-50/60 p-5 ring-1 ring-indigo-100">
        <p className="mb-4 flex items-center gap-2 font-bold text-gray-800">
          <Plus className="size-4 text-indigo-600" /> New Coupon
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Code</label>
            <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required className={field} placeholder="SAVE20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Discount Type</label>
            <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))} className={field}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (BDT)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Value</label>
            <input type="number" min={1} value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} required className={field} placeholder="20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Expires</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} className={field} />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-60">
            <Plus className="size-4" />
            {isSubmitting ? "Creating…" : "Create Coupon"}
          </button>
        </div>
      </form>

      {/* Status */}
      {status ? (
        <div className={`rounded-xl px-4 py-3 text-sm ${isErr ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{status}</div>
      ) : null}

      {/* Table */}
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No coupons yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Expires</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag className="size-3.5 text-indigo-400 shrink-0" />
                        <input
                          value={row.code}
                          onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, code: e.target.value } : r))}
                          className="w-24 rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs font-mono outline-none focus:border-indigo-400"
                        />
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <select
                        value={row.discountType}
                        onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, discountType: e.target.value } : r))}
                        className="rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs outline-none focus:border-indigo-400"
                      >
                        <option value="percentage">%</option>
                        <option value="flat">BDT</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <input
                        type="number"
                        value={row.discountValue}
                        onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, discountValue: Number(e.target.value || 0) } : r))}
                        className="w-16 rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-right text-xs outline-none focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => setRows((prev) => prev.map((r, j) => j === i ? { ...r, isActive: !r.isActive } : r))}
                        className={`rounded-full p-1 ${row.isActive ? "text-emerald-500" : "text-red-400"}`}
                      >
                        {row.isActive ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                      </button>
                    </td>
                    <td className="hidden px-4 py-2.5 md:table-cell">
                      <input
                        type="date"
                        value={row.expiresAt}
                        onChange={(e) => setRows((prev) => prev.map((r, j) => j === i ? { ...r, expiresAt: e.target.value } : r))}
                        className="rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs outline-none focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateCoupon(row)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          <Save className="size-3" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCoupon(row.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
