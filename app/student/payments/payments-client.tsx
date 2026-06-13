"use client"

import { useState } from "react"
import {
  CreditCard,
  CheckCircle2,
  Clock,
  TrendingDown,
  Banknote,
  X,
  Lock,
  ShieldCheck,
} from "lucide-react"

type PaymentRow = {
  id: string
  amount: number
  method: string
  status: string
  txnId: string
  date: string
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (["paid", "success", "completed", "valid"].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="size-3" />
        {status}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
      <Clock className="size-3" />
      {status}
    </span>
  )
}

/** Format card number with spaces every 4 digits */
function formatCard(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim()
}

export function StudentPaymentsClient({
  payments: initialPayments,
  totalPaid: initialTotalPaid,
  pendingFees,
  selectedCourse,
}: {
  payments: PaymentRow[]
  totalPaid: number
  pendingFees: number
  selectedCourse: { id: string; title: string; price: number } | null
}) {
  const [amount, setAmount] = useState(
    selectedCourse ? String(selectedCourse.price) : pendingFees > 0 ? String(pendingFees) : ""
  )

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardError, setCardError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // After success
  const [success, setSuccess] = useState(false)
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments)
  const [totalPaid, setTotalPaid] = useState(initialTotalPaid)

  const openModal = () => {
    if (!amount || Number(amount) <= 0) return
    setCardNumber("")
    setCardName("")
    setExpiry("")
    setCvv("")
    setCardError("")
    setSuccess(false)
    setShowModal(true)
  }

  const handleExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 3) {
      setExpiry(digits.slice(0, 2) + "/" + digits.slice(2))
    } else {
      setExpiry(digits)
    }
  }

  const onPay = async () => {
    setCardError("")
    const rawCard = cardNumber.replace(/\s/g, "")

    if (rawCard.length !== 16) {
      setCardError("Please enter a valid 16-digit card number.")
      return
    }
    if (!cardName.trim()) {
      setCardError("Please enter the cardholder name.")
      return
    }
    if (expiry.length < 5) {
      setCardError("Please enter a valid expiry date (MM/YY).")
      return
    }
    if (cvv.length < 3) {
      setCardError("Please enter a valid CVV.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          courseId: selectedCourse?.id,
          cardNumber: rawCard,
        }),
      })
      const data = (await res.json()) as {
        success?: boolean
        txnId?: string
        message?: string
        error?: string
      }

      if (!res.ok || !data.success) {
        setCardError(data.error ?? "Payment failed. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Add the new payment to the local list
      const newRow: PaymentRow = {
        id: data.txnId ?? String(Date.now()),
        amount: Number(amount),
        method: "Card",
        status: "paid",
        txnId: data.txnId ?? "",
        date: new Date().toLocaleDateString("en-BD"),
      }
      setPayments((prev) => [newRow, ...prev])
      setTotalPaid((prev) => prev + Number(amount))
      setSuccess(true)
      setIsSubmitting(false)
    } catch {
      setCardError("Network error. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">Review your payment history and pay pending fees.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-md">
          <CheckCircle2 className="mb-2 size-6 opacity-80" />
          <p className="text-2xl font-extrabold tabular-nums">
            BDT {totalPaid.toLocaleString("en-BD")}
          </p>
          <p className="mt-0.5 text-sm font-medium opacity-80">Total Paid</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-5 text-white shadow-md">
          <TrendingDown className="mb-2 size-6 opacity-80" />
          <p className="text-2xl font-extrabold tabular-nums">
            BDT {pendingFees.toLocaleString("en-BD")}
          </p>
          <p className="mt-0.5 text-sm font-medium opacity-80">Pending Fees</p>
        </div>

        {/* Pay now panel */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          {selectedCourse ? (
            <div className="mb-3 rounded-xl bg-indigo-50 p-3">
              <p className="text-xs text-indigo-400">Course</p>
              <p className="text-sm font-semibold text-indigo-800">{selectedCourse.title}</p>
            </div>
          ) : null}
          <label htmlFor="pay-amount" className="text-xs font-semibold text-gray-600">
            Amount (BDT)
          </label>
          <input
            id="pay-amount"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            onClick={openModal}
            disabled={!amount || Number(amount) <= 0}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Banknote className="size-4" />
            Pay Now
          </button>
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2 border-b border-gray-100 p-5">
          <CreditCard className="size-5 text-indigo-500" />
          <h2 className="text-lg font-extrabold text-gray-800">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Method</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Txn ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-5 py-3 text-gray-500">{p.date}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800 tabular-nums">
                      BDT {p.amount.toLocaleString("en-BD")}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.method}</td>
                    <td className="px-5 py-3">{statusBadge(p.status)}</td>
                    <td className="px-5 py-3 max-w-[8rem] truncate text-xs text-gray-400">{p.txnId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Card Payment Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2">
                  <CreditCard className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-200">Secure Payment</p>
                  <p className="text-lg font-extrabold text-white">
                    BDT {Number(amount).toLocaleString("en-BD")}
                  </p>
                </div>
              </div>
              {!isSubmitting && !success && (
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="p-6">
              {success ? (
                /* ── Success State ── */
                <div className="flex flex-col items-center py-4 text-center">
                  <div className="mb-4 rounded-full bg-emerald-100 p-4">
                    <ShieldCheck className="size-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-800">Payment Successful!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    BDT {Number(amount).toLocaleString("en-BD")} has been paid successfully.
                  </p>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      if (selectedCourse) {
                        window.location.href = "/student/courses"
                      }
                    }}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity"
                  >
                    {selectedCourse ? "Go to My Courses" : "Done"}
                  </button>

                </div>
              ) : (
                /* ── Card Form ── */
                <div className="space-y-4">
                  {/* Card number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        maxLength={19}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm font-mono tracking-widest outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-300" />
                    </div>
                  </div>

                  {/* Cardholder name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => handleExpiryInput(e.target.value)}
                        maxLength={5}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        CVV
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {cardError && (
                    <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {cardError}
                    </p>
                  )}

                  {/* Pay button */}
                  <button
                    onClick={onPay}
                    disabled={isSubmitting}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <Lock className="size-4" />
                    {isSubmitting ? "Processing…" : `Pay BDT ${Number(amount).toLocaleString("en-BD")}`}
                  </button>

                  {/* Security note */}
                  <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <ShieldCheck className="size-3.5" />
                    Your payment is secure and encrypted
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
