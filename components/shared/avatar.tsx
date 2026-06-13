import { cn } from "@/lib/utils"

const PALETTE = [
  "from-violet-500 to-purple-600",
  "from-indigo-500 to-blue-600",
  "from-cyan-500 to-teal-600",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
]

function pickGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string
  src?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const sizeClass = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-lg",
    xl: "size-20 text-2xl",
  }[size]

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover ring-2 ring-white", sizeClass, className)}
      />
    )
  }

  return (
    <div
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-white",
        pickGradient(name),
        sizeClass,
        className
      )}
    >
      {initials(name)}
    </div>
  )
}
