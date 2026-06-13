"use client"

import Link from "next/link"

type MarkRow = {
  examId: string
  examName: string
  subject: string
  date: string
  yourMark: number | null
  highestMark: number | null
  totalMarks: number
}

export function MarksTable({ rows }: { rows: MarkRow[] }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const hasMark = row.yourMark !== null
        const pct = hasMark ? Math.round((row.yourMark! / row.totalMarks) * 100) : null
        const passing = pct !== null && pct >= 50
        const highPct =
          row.highestMark !== null ? Math.round((row.highestMark / row.totalMarks) * 100) : null

        return (
          <Link
            key={row.examId}
            href={`/student/marks/${row.examId}`}
            className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{row.examName}</p>
                <p className="text-xs text-gray-400">{row.subject} · {row.date}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {hasMark ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      passing
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {passing ? "Pass" : "Fail"}
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-400">
                    Not graded
                  </span>
                )}
                <span className="text-sm font-bold text-gray-700 tabular-nums">
                  {hasMark ? `${row.yourMark}/${row.totalMarks}` : `—/${row.totalMarks}`}
                </span>
              </div>
            </div>

            {hasMark && pct !== null ? (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Your score</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${passing ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {highPct !== null ? (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Class highest</span>
                    <span className="font-semibold text-indigo-600">
                      {row.highestMark}/{row.totalMarks} ({highPct}%)
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
