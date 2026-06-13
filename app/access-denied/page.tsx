import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Access denied</CardTitle>
          <CardDescription>
            Your account does not have permission to open this admin page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/student/dashboard">Student Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
