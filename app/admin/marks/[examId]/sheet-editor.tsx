"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type MarkRow = {
  id: string
  roll_number: string
  marks_obtained: number
  remarks: string | null
  student: { name: string }
}

export function MarksSheetEditor({
  examId,
  initialRows,
}: {
  examId: string
  initialRows: MarkRow[]
}) {
  const [rows, setRows] = useState(initialRows)
  const [status, setStatus] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  const average = useMemo(() => {
    if (rows.length === 0) return 0
    const total = rows.reduce((sum, row) => sum + row.marks_obtained, 0)
    return total / rows.length
  }, [rows])

  const updateDraft = (
    id: string,
    patch: Partial<Pick<MarkRow, "marks_obtained" | "remarks">>
  ) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const saveRow = async (row: MarkRow) => {
    setSavingId(row.id)
    setStatus("")

    try {
      const response = await fetch(`/api/admin/marks/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markId: row.id,
          marks_obtained: Number(row.marks_obtained),
          remarks: row.remarks ?? "",
        }),
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        setStatus(payload.error ?? "Failed to save row.")
        setSavingId(null)
        return
      }

      setStatus(`Saved changes for roll ${row.roll_number}.`)
      setSavingId(null)
    } catch {
      setStatus("Failed to save row due to a network error.")
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Students: {rows.length} • Average Mark: {average.toFixed(2)}
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Roll Number</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Marks Obtained</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.roll_number}</TableCell>
              <TableCell>{row.student.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={row.marks_obtained}
                  onChange={(event) =>
                    updateDraft(row.id, {
                      marks_obtained: Number(event.target.value || 0),
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.remarks ?? ""}
                  onChange={(event) => updateDraft(row.id, { remarks: event.target.value })}
                />
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => saveRow(row)}
                  disabled={savingId === row.id}
                >
                  {savingId === row.id ? "Saving..." : "Save"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  )
}
