"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Globe, MapPin, Calendar, Layers, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const DAYS_OF_WEEK = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const

function DaySelector({
  value,
  onChange,
  accentColor = "indigo",
}: {
  value: string
  onChange: (value: string) => void
  accentColor?: "indigo" | "amber"
}) {
  const selected = value ? value.split(", ").filter(Boolean) : []

  const toggle = (day: string) => {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day]
    // preserve week order
    const ordered = DAYS_OF_WEEK.filter((d) => next.includes(d))
    onChange(ordered.join(", "))
  }

  const colors = {
    indigo: {
      active: "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30",
      inactive:
        "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50",
    },
    amber: {
      active: "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30",
      inactive:
        "bg-white text-gray-600 border border-gray-200 hover:border-amber-300 hover:bg-amber-50",
    },
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS_OF_WEEK.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            selected.includes(day) ? colors[accentColor].active : colors[accentColor].inactive
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  )
}

type Instructor = {
  id: string
  name: string
  email: string
}

type CourseFormValues = {
  title: string
  slug: string
  description: string
  price: string
  thumbnail: string
  instructorId: string
  isPublished: boolean
  courseType: "online" | "offline"
  location: string
  schedule: string
  time: string
  batch: string
}

const TIME_OPTIONS = [
  "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM",
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM",
]

export function CourseForm({
  mode,
  courseId,
  instructors,
  initialValues,
}: {
  mode: "create" | "edit"
  courseId?: string
  instructors: Instructor[]
  initialValues: CourseFormValues
}) {
  const router = useRouter()
  const [values, setValues] = useState<CourseFormValues>(initialValues)
  const [status, setStatus] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("")
    setIsSubmitting(true)

    // Ensure instructorId is provided to satisfy DB foreign key constraint
    const finalInstructorId = values.instructorId || instructors[0]?.id || ""

    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      price: Number(values.price),
      thumbnail: values.thumbnail,
      instructor_id: finalInstructorId,
      is_published: values.isPublished,
      course_type: values.courseType,
      location: values.courseType === "offline" ? values.location : null,
      schedule: values.schedule || null,
      time: values.time || null,
      batch: values.courseType === "offline" ? values.batch : null,
    }

    try {
      const response = await fetch(
        mode === "create" ? "/api/courses" : `/api/courses/${courseId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setStatus(result.error ?? "Failed to save course.")
        setIsSubmitting(false)
        return
      }

      router.push("/admin/courses")
      router.refresh()
    } catch {
      setStatus("Network error while saving course.")
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      {/* Course Type Selector */}
      <div className="space-y-3">
        <Label className="text-base font-bold text-gray-800">Course Type</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Online Card */}
          <button
            type="button"
            onClick={() => setValues((prev) => ({ ...prev, courseType: "online" }))}
            className={`relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all ${
              values.courseType === "online"
                ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-600/20"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${values.courseType === "online" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              <Globe className="size-5" />
            </div>
            <h3 className={`mt-3 font-bold ${values.courseType === "online" ? "text-indigo-900" : "text-gray-800"}`}>
              Online Course
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Recorded video classes uploaded by instructors. Students watch and track progress digitally.
            </p>
            {values.courseType === "online" && (
              <span className="absolute top-4 right-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                Selected
              </span>
            )}
          </button>

          {/* Offline Card */}
          <button
            type="button"
            onClick={() => setValues((prev) => ({ ...prev, courseType: "offline" }))}
            className={`relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all ${
              values.courseType === "offline"
                ? "border-amber-600 bg-amber-50/50 shadow-sm ring-2 ring-amber-600/20"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${values.courseType === "offline" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              <MapPin className="size-5" />
            </div>
            <h3 className={`mt-3 font-bold ${values.courseType === "offline" ? "text-amber-900" : "text-gray-800"}`}>
              Offline Course
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Physical/in-person classes. Students view scheduling and location details, paying fees online.
            </p>
            {values.courseType === "offline" && (
              <span className="absolute top-4 right-4 rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                Selected
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={values.title}
            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={values.slug}
            onChange={(event) => setValues((prev) => ({ ...prev, slug: event.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Course overview..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price (BDT)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={values.price}
            onChange={(event) => setValues((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            value={values.thumbnail}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, thumbnail: event.target.value }))
            }
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
        <div>
          <Label className="text-sm font-bold text-slate-900">Assign Instructor</Label>
          <p className="text-xs text-slate-500">Assignment sends an automatic email and in-app notification to the teacher.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {instructors.map((instructor) => (
            <Button
              key={instructor.id}
              type="button"
              variant={values.instructorId === instructor.id ? "default" : "outline"}
              className="h-auto justify-start py-2 text-left"
              onClick={() =>
                setValues((prev) => ({ ...prev, instructorId: instructor.id }))
              }
            >
              <span className="flex flex-col">
                <span>{instructor.name}</span>
                <span className="text-xs text-muted-foreground">{instructor.email}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Conditional Fields based on Course Type */}
      {values.courseType === "online" ? (
        <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5">
          <div>
            <Label className="text-sm font-bold text-indigo-950">Online Course Details</Label>
            <p className="text-xs text-indigo-600/80">Provide class dates and time.</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs font-semibold text-indigo-900">
                <Calendar className="size-3.5" /> Class Days
              </Label>
              <DaySelector
                value={values.schedule}
                onChange={(val) => setValues((prev) => ({ ...prev, schedule: val }))}
                accentColor="indigo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_online" className="flex items-center gap-1 text-xs font-semibold text-indigo-900">
                <Clock className="size-3.5" /> Time
              </Label>
              <select
                id="time_online"
                value={values.time}
                onChange={(event) => setValues((prev) => ({ ...prev, time: event.target.value }))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
          <div>
            <Label className="text-sm font-bold text-amber-950">Offline Course Details</Label>
            <p className="text-xs text-amber-700/80">Provide physical location, timetable schedule, and target batch.</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1 text-xs font-semibold text-amber-900">
                <MapPin className="size-3.5" /> Location / Address
              </Label>
              <Input
                id="location"
                value={values.location}
                onChange={(event) => setValues((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="e.g. Dhanmondi Campus, Room 302"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs font-semibold text-amber-900">
                <Calendar className="size-3.5" /> Class Days
              </Label>
              <DaySelector
                value={values.schedule}
                onChange={(val) => setValues((prev) => ({ ...prev, schedule: val }))}
                accentColor="amber"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_offline" className="flex items-center gap-1 text-xs font-semibold text-amber-900">
                <Clock className="size-3.5" /> Time
              </Label>
              <select
                id="time_offline"
                value={values.time}
                onChange={(event) => setValues((prev) => ({ ...prev, time: event.target.value }))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch" className="flex items-center gap-1 text-xs font-semibold text-amber-900">
                <Layers className="size-3.5" /> Batch Name
              </Label>
              <Input
                id="batch"
                value={values.batch}
                onChange={(event) => setValues((prev) => ({ ...prev, batch: event.target.value }))}
                placeholder="e.g. Batch 12"
                className="bg-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Published Status</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={values.isPublished ? "default" : "outline"}
            onClick={() => setValues((prev) => ({ ...prev, isPublished: true }))}
          >
            Published
          </Button>
          <Button
            type="button"
            variant={!values.isPublished ? "default" : "outline"}
            onClick={() => setValues((prev) => ({ ...prev, isPublished: false }))}
          >
            Unpublished
          </Button>
        </div>
      </div>

      {status ? <p className="text-sm text-destructive">{status}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : mode === "create"
            ? "Create Course"
            : "Update Course"}
      </Button>
    </form>
  )
}

