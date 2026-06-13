"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Lesson = {
  id: string
  title: string
  description?: string | null
  video_url: string | null
  duration: number | null
  order: number
}

export function LessonManager({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newVideo, setNewVideo] = useState("")
  const [newDuration, setNewDuration] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError("")
    const res = await fetch(`/api/teacher/courses/${courseId}`)
    const data = (await res.json()) as { course?: { lessons: Lesson[] }; error?: string }
    if (!res.ok) {
      setError(data.error ?? "Failed to load lessons.")
      setLessons([])
      return
    }
    setLessons(data.course?.lessons ?? [])
  }, [courseId])

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(() => {
      void load().finally(() => {
        if (!cancelled) setLoading(false)
      })
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [load])

  const addLesson = async () => {
    setError("")
    const title = newTitle.trim()
    if (!title) return
    const res = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: newDescription.trim() || null,
        video_url: newVideo.trim() || null,
        duration: newDuration.trim() === "" ? null : Number(newDuration),
      }),
    })
    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(data.error ?? "Could not create lesson.")
      return
    }
    setNewTitle("")
    setNewDescription("")
    setNewVideo("")
    setNewDuration("")
    await load()
  }

  const saveLesson = async (lesson: Lesson) => {
    setSavingId(lesson.id)
    setError("")
    const res = await fetch(`/api/teacher/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: lesson.title,
        description: lesson.description,
        video_url: lesson.video_url,
        duration: lesson.duration,
        order: lesson.order,
      }),
    })
    const data = (await res.json()) as { error?: string }
    setSavingId(null)
    if (!res.ok) {
      setError(data.error ?? "Could not save lesson.")
      return
    }
    await load()
  }

  const deleteLesson = async (id: string) => {
    if (!window.confirm("Delete this lesson?")) return
    setError("")
    const res = await fetch(`/api/teacher/lessons/${id}`, { method: "DELETE" })
    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      setError(data.error ?? "Could not delete lesson.")
      return
    }
    await load()
  }

  const updateLesson = (id: string, patch: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        <span className="text-sm">Loading lessons…</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="new-title">New lesson title</Label>
          <Input
            id="new-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Introduction to limits"
          />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="new-desc">Description (optional)</Label>
          <Input
            id="new-desc"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Overview of topics covered…"
          />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="new-video">Video URL (optional)</Label>
          <Input
            id="new-video"
            value={newVideo}
            onChange={(e) => setNewVideo(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="new-duration">Duration (sec)</Label>
          <Input
            id="new-duration"
            type="number"
            min={0}
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            placeholder="1200"
          />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-5">
          <Button type="button" onClick={() => void addLesson()} disabled={!newTitle.trim()}>
            Add lesson
          </Button>
        </div>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lessons yet. Add your first lesson above.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead className="min-w-[12rem]">Title</TableHead>
                <TableHead className="min-w-[12rem]">Description</TableHead>
                <TableHead className="min-w-[10rem]">Video URL</TableHead>
                <TableHead className="w-24 text-right">Duration</TableHead>
                <TableHead className="text-right min-w-[8rem]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <Input
                      className="h-8 w-16"
                      type="number"
                      value={lesson.order}
                      onChange={(e) =>
                        updateLesson(lesson.id, { order: Number.parseInt(e.target.value, 10) || 0 })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 min-w-0"
                      value={lesson.title}
                      onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 min-w-0"
                      value={lesson.description ?? ""}
                      onChange={(e) => updateLesson(lesson.id, { description: e.target.value || null })}
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 min-w-0"
                      value={lesson.video_url ?? ""}
                      onChange={(e) => updateLesson(lesson.id, { video_url: e.target.value || null })}
                      placeholder="URL"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 w-full text-right"
                      type="number"
                      min={0}
                      value={lesson.duration ?? ""}
                      onChange={(e) =>
                        updateLesson(lesson.id, {
                          duration: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="space-x-1 text-right whitespace-nowrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={savingId === lesson.id}
                      onClick={() => void saveLesson(lesson)}
                    >
                      {savingId === lesson.id ? "Saving…" : "Save"}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void deleteLesson(lesson.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

