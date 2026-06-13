import { Spinner } from "@/components/ui/spinner"

export default function TeacherLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
      <Spinner className="size-6" />
      <span className="text-sm">Loading…</span>
    </div>
  )
}
