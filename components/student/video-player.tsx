"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type VideoPlayerProps = {
  lessonId: string
  videoUrl: string | null
  initialCompleted: boolean
}

export function VideoPlayer({ lessonId, videoUrl, initialCompleted }: VideoPlayerProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const toggleCompletion = async (checked: boolean) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: checked }),
      })

      if (res.ok) {
        setIsCompleted(checked)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update progress", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const renderPlayer = () => {
    if (!videoUrl) {
      return (
        <div className="flex flex-col items-center justify-center aspect-video bg-gray-900 rounded-3xl border-4 border-gray-800 text-gray-500">
          <Loader2 className="size-10 mb-4 animate-spin opacity-20" />
          <p className="text-sm font-bold">No video source available</p>
          <p className="text-xs opacity-60">Please contact your instructor</p>
        </div>
      )
    }

    // YouTube Handling
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId = videoUrl.includes("v=") 
        ? videoUrl.split("v=")[1].split("&")[0] 
        : videoUrl.split("/").pop()
      
      return (
        <iframe
          className="w-full aspect-video rounded-3xl shadow-2xl ring-1 ring-white/10"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    // Google Drive Handling
    if (videoUrl.includes("drive.google.com")) {
      const driveId = videoUrl.split("/d/")[1]?.split("/")[0]
      return (
        <iframe
          className="w-full aspect-video rounded-3xl shadow-2xl ring-1 ring-white/10"
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          allow="autoplay"
        />
      )
    }

    // Direct MP4 / HTML5
    return (
      <video
        className="w-full aspect-video rounded-3xl shadow-2xl ring-1 ring-white/10 bg-black"
        controls
        controlsList="nodownload"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden bg-black rounded-3xl shadow-2xl">
        {renderPlayer()}
      </div>

      <div className="flex items-center justify-between p-6 bg-white rounded-3xl ring-1 ring-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>
            {isCompleted ? <CheckCircle2 className="size-6" /> : <Circle className="size-6" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isCompleted ? "Lesson Completed" : "Mark as Finished"}
            </p>
            <p className="text-xs text-gray-400">Track your learning progress</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isUpdating && <Loader2 className="size-4 animate-spin text-indigo-600" />}
          <Checkbox
            id="completed"
            checked={isCompleted}
            onCheckedChange={(checked) => toggleCompletion(!!checked)}
            disabled={isUpdating}
            className="size-6 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
