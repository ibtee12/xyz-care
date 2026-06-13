"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type CourseRow = {
  id: string
  title: string
  instructor: string
  price: number
  isPublished: boolean
  courseType?: string
}

export function CoursesTable({ rows }: { rows: CourseRow[] }) {
  const router = useRouter()
  const [status, setStatus] = useState("")
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all")

  const deleteCourse = async (courseId: string) => {
    setStatus("")
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setStatus(payload.error ?? "Failed to delete course.")
        return
      }
      router.refresh()
    } catch {
      setStatus("Network error while deleting course.")
    }
  }

  const filteredRows = rows.filter((row) => {
    if (filter === "online") return row.courseType !== "offline"
    if (filter === "offline") return row.courseType === "offline"
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b pb-3">
        <span className="text-xs font-semibold text-muted-foreground mr-2">Filter Type:</span>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-xl h-8 text-xs font-bold"
        >
          All ({rows.length})
        </Button>
        <Button
          variant={filter === "online" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("online")}
          className="rounded-xl h-8 text-xs font-bold"
        >
          Online ({rows.filter((r) => r.courseType !== "offline").length})
        </Button>
        <Button
          variant={filter === "offline" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("offline")}
          className="rounded-xl h-8 text-xs font-bold"
        >
          Offline ({rows.filter((r) => r.courseType === "offline").length})
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((course) => {
            const isOffline = course.courseType === "offline"
            return (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/courses/${course.id}`} className="hover:underline text-gray-900 font-bold">
                    {course.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide ${
                      isOffline
                        ? "bg-amber-100 text-amber-800 ring-1 ring-amber-400/30"
                        : "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400/30"
                    }`}
                  >
                    {isOffline ? "Offline" : "Online"}
                  </span>
                </TableCell>
                <TableCell>{isOffline ? <span className="text-gray-400 italic">Physical Batch</span> : course.instructor}</TableCell>
                <TableCell>BDT {course.price.toLocaleString("en-BD")}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold ${course.isPublished ? "text-emerald-600" : "text-gray-400"}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="flex flex-wrap gap-1.5">
                  <Button variant="secondary" size="sm" asChild className="h-8 text-xs">
                    <Link href={`/admin/courses/${course.id}`}>Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                    <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => deleteCourse(course.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
          {filteredRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                No courses match the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {status ? <p className="text-sm text-destructive">{status}</p> : null}
    </div>
  )
}

