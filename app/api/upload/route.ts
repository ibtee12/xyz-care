import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createClient } from "@supabase/supabase-js"

import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Storage not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local" }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
    const path = `videos/${session.user.id}/${Date.now()}-${sanitizedName}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(path, bytes, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch {
    return NextResponse.json({ error: "Failed to parse form data." }, { status: 500 })
  }
}
