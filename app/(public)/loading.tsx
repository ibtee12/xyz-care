import { Spinner } from "@/components/ui/spinner"

export default function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  )
}
