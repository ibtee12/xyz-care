import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

type RegisterBody = {
  name?: string
  email?: string
  password?: string
  phone?: string
  classLevel?: string
  institution?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody
  const name = body.name?.trim()
  const email = body.email?.trim()?.toLowerCase()
  const password = body.password
  const phone = body.phone?.trim() || null
  const classLevel = body.classLevel?.trim()
  const institution = body.institution?.trim()

  if (!name || !email || !password || !classLevel || !institution) {
    return NextResponse.json(
      { error: "Name, email, password, class and institution are required." },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters long." },
      { status: 400 }
    )
  }

  const existingUser = await db.user.findFirst({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already exists." },
      { status: 409 }
    )
  }

  // Generate MatrixID by finding the highest existing M-XXXX number
  const lastStudent = await db.user.findFirst({
    where: { role: UserRole.student, roll_number: { startsWith: "M-" } },
    orderBy: { roll_number: "desc" },
    select: { roll_number: true },
  })
  const lastNum = lastStudent?.roll_number ? parseInt(lastStudent.roll_number.replace("M-", ""), 10) : 0
  const matrixId = `M-${(lastNum + 1).toString().padStart(4, "0")}`

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        roll_number: matrixId,
        classLevel,
        institution,
        role: UserRole.student,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roll_number: true,
      },
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (err: unknown) {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } }
    if (prismaErr.code === "P2002") {
      const fields = prismaErr.meta?.target ?? []
      if (fields.includes("email")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
      }
      // roll_number collision — retry with next available number
      const allRolls = await db.user.findMany({
        where: { roll_number: { startsWith: "M-" } },
        select: { roll_number: true },
        orderBy: { roll_number: "desc" },
      })
      const maxNum = allRolls.reduce((max, u) => {
        const n = parseInt(u.roll_number?.replace("M-", "") ?? "0", 10)
        return n > max ? n : max
      }, 0)
      const retryId = `M-${(maxNum + 1).toString().padStart(4, "0")}`
      const user = await db.user.create({
        data: { name: name!, email: email!, password: hashedPassword, phone, roll_number: retryId, classLevel, institution, role: UserRole.student },
        select: { id: true, name: true, email: true, role: true, roll_number: true },
      })
      return NextResponse.json({ user }, { status: 201 })
    }
    console.error("[register]", err)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
