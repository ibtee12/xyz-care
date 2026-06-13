"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Search, Users } from "lucide-react"

import { Avatar } from "@/components/shared/avatar"
import { EmptyState } from "@/components/shared/empty-state"

type StudentRow = {
  id: string
  name: string
  email: string
  rollNumber: string
  classLevel: string
  batch: string
  createdAt: string
  enrolledCoursesCount: number
  paymentStatus: string
}

export function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const [query, setQuery] = useState("")
  const [classFilter, setClassFilter] = useState("All")
  const [batchFilter, setBatchFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All")

  const uniqueClasses = useMemo(() => {
    const classes = new Set(rows.map(r => r.classLevel).filter(c => c && c !== "N/A"))
    return ["All", ...Array.from(classes)]
  }, [rows])

  const uniqueBatches = useMemo(() => {
    const batches = new Set(rows.map(r => r.batch).filter(b => b && b !== "Unassigned"))
    return ["All", ...Array.from(batches)]
  }, [rows])

  const filteredRows = useMemo(() => {
    let result = rows

    if (classFilter !== "All") {
      result = result.filter(r => r.classLevel === classFilter)
    }

    if (batchFilter !== "All") {
      result = result.filter(r => r.batch === batchFilter)
    }

    if (dateFilter === "New Students (30d)") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      result = result.filter(r => new Date(r.createdAt) >= thirtyDaysAgo)
    } else if (dateFilter === "Old Students") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      result = result.filter(r => new Date(r.createdAt) < thirtyDaysAgo)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((r) =>
        [r.name, r.email, r.rollNumber].some((v) => v.toLowerCase().includes(q))
      )
    }

    return result
  }, [query, classFilter, batchFilter, dateFilter, rows])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-500">Search and manage all registered students.</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* Search and Filters */}
        <div className="border-b border-gray-100 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or roll…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Classes" : c}</option>
                ))}
              </select>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {uniqueBatches.map(b => (
                  <option key={b} value={b}>{b === "All" ? "All Batches" : b}</option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                <option value="All">All Time</option>
                <option value="New Students (30d)">New Students (Last 30d)</option>
                <option value="Old Students">Old Students (&gt; 30d)</option>
              </select>
            </div>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Users} title="No students found" description="Try a different search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 text-left">Roll</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">Class</th>
                  <th className="px-5 py-3 text-left hidden xl:table-cell">Batch</th>
                  <th className="px-5 py-3 text-center hidden md:table-cell">Courses</th>
                  <th className="px-5 py-3 text-left">Payment</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRows.map((row, idx) => {
                  const paid = ["paid", "success", "completed"].includes(row.paymentStatus.toLowerCase())
                  return (
                    <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.name} size="sm" />
                          <span className="font-semibold text-gray-800">{row.name}</span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-gray-500 sm:table-cell max-w-[12rem] truncate">{row.email}</td>
                      <td className="px-5 py-3 tabular-nums text-gray-400">{row.rollNumber}</td>
                      <td className="hidden px-5 py-3 text-gray-600 lg:table-cell">{row.classLevel}</td>
                      <td className="hidden px-5 py-3 text-gray-600 xl:table-cell">
                        {row.batch !== "Unassigned" ? (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{row.batch}</span>
                        ) : "-"}
                      </td>
                      <td className="hidden px-5 py-3 text-center tabular-nums text-gray-600 md:table-cell">
                        {row.enrolledCoursesCount}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {row.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/students/${row.id}`}
                          className="inline-flex items-center rounded-xl border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
