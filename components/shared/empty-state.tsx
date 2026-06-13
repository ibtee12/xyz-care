import { type LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-indigo-50">
        <Icon className="size-8 text-indigo-400" />
      </div>
      <p className="text-base font-semibold text-gray-700">{title}</p>
      {description ? <p className="max-w-xs text-sm text-gray-400">{description}</p> : null}
    </div>
  )
}
