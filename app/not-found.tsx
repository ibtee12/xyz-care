import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Page not found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or may have been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
