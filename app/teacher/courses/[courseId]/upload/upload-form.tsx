"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Link as LinkIcon, UploadCloud, CheckCircle, AlertCircle, Film } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type UploadFormProps = {
  courseId: string
  courseTitle: string
  nextOrder: string
}

export function UploadForm({ courseId, courseTitle, nextOrder }: UploadFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [order, setOrder] = useState(nextOrder)

  // Options: "url" | "file"
  const [uploadOption, setUploadOption] = useState<"url" | "file">("url")
  const [videoUrl, setVideoUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setStatus("")

    if (!title.trim()) {
      setError("Lesson title is required.")
      return
    }

    setIsSubmitting(true)

    let finalVideoUrl = videoUrl.trim()

    // Handle Option 2: Upload File
    if (uploadOption === "file") {
      if (!selectedFile) {
        setError("Please select a video file to upload.")
        setIsSubmitting(false)
        return
      }

      setStatus("Uploading video file to secure storage...")
      const formData = new FormData()
      formData.append("file", selectedFile)

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const uploadData = (await uploadRes.json()) as { url?: string; error?: string }

        if (!uploadRes.ok || !uploadData.url) {
          setError(uploadData.error ?? "Failed to upload video file.")
          setIsSubmitting(false)
          return
        }

        finalVideoUrl = uploadData.url
      } catch {
        setError("Network error encountered during storage upload.")
        setIsSubmitting(false)
        return
      }
    }

    setStatus("Saving lesson and dispatching student notifications...")

    const durationSeconds = durationMinutes ? Number(durationMinutes) * 60 : null

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          title: title.trim(),
          description: description.trim() || null,
          video_url: finalVideoUrl || null,
          duration: durationSeconds,
          order: Number(order),
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setError(data.error ?? "Could not save uploaded class.")
        setIsSubmitting(false)
        return
      }

      setStatus("Successfully uploaded!")
      router.push(`/teacher/courses/${courseId}`)
      router.refresh()
    } catch {
      setError("Network error while creating lesson record.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Film className="size-5 text-indigo-600" /> Upload Recorded Class
        </h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Course: <span className="text-indigo-950 font-bold">{courseTitle}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Title & Order Grid */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="title" className="text-xs font-bold text-gray-700">Lesson Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 1: Introduction to Advanced Logic"
              required
              className="rounded-xl border-gray-200 focus-visible:ring-indigo-600 font-medium"
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="order" className="text-xs font-bold text-gray-700">Class / Week #</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
              className="rounded-xl border-gray-200 focus-visible:ring-indigo-600 font-mono font-bold text-center"
            />
          </div>
        </div>

        {/* Video Source Cards */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-gray-700">Video Source Method *</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Option 1: URL */}
            <button
              type="button"
              onClick={() => setUploadOption("url")}
              className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                uploadOption === "url"
                  ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/10"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`p-2 rounded-lg mt-0.5 ${uploadOption === "url" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                <LinkIcon className="size-4" />
              </div>
              <div>
                <p className={`text-xs font-bold ${uploadOption === "url" ? "text-indigo-950" : "text-gray-700"}`}>Option 1: Paste URL</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Embed YouTube or public Google Drive video links instantly.</p>
              </div>
            </button>

            {/* Option 2: File Upload */}
            <button
              type="button"
              onClick={() => setUploadOption("file")}
              className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                uploadOption === "file"
                  ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/10"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className={`p-2 rounded-lg mt-0.5 ${uploadOption === "file" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                <UploadCloud className="size-4" />
              </div>
              <div>
                <p className={`text-xs font-bold ${uploadOption === "file" ? "text-indigo-950" : "text-gray-700"}`}>Option 2: Direct Upload</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Securely host your media file via platform cloud storage.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Source Inputs */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5">
          {uploadOption === "url" ? (
            <div className="space-y-2">
              <Label htmlFor="video-url" className="text-xs font-bold text-indigo-950">Video/Drive Link URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://drive.google.com/file/d/..."
                className="bg-white rounded-xl border-gray-200 focus-visible:ring-indigo-600"
              />
              <p className="text-[10px] text-gray-400">Students will stream this track using dynamic player mode.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-xs font-bold text-indigo-950">Select Media File</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="bg-white rounded-xl border-gray-200 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              {selectedFile && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle className="size-3.5 shrink-0" /> Ready to transmit: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-bold text-gray-700">Lesson Summary / Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, attached study notes references, or pre-requisite guidance..."
            className="rounded-xl border-gray-200 focus-visible:ring-indigo-600 text-xs"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor="duration" className="text-xs font-bold text-gray-700">Duration (Minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 45"
            className="rounded-xl border-gray-200 focus-visible:ring-indigo-600"
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 font-medium">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </div>
        )}

        {status && (
          <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700 flex items-center gap-2 font-medium">
            <span className="size-2 rounded-full bg-indigo-600 animate-pulse shrink-0" /> {status}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" asChild className="rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800">
            <Link href={`/teacher/courses/${courseId}`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 h-auto shadow-sm"
          >
            {isSubmitting ? "Processing Upload..." : "Publish Lesson"}
          </Button>
        </div>
      </form>
    </div>
  )
}
