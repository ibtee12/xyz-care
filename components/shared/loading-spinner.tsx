import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        <div className="size-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur-xl" />
        <Loader2 className="absolute inset-0 m-auto size-8 animate-spin text-indigo-600" />
      </div>
      <p className="text-sm font-medium text-indigo-600">Loading…</p>
    </div>
  )
}
