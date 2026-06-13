"use client"

import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"

export function LogoutButton({ variant = "ghost" }: { variant?: "ghost" | "outline" | "destructive" }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ redirect: false })
      router.replace("/")
      router.refresh()
    })
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
    >
      {isPending ? "Logging out…" : "Log out"}
    </Button>
  )
}
