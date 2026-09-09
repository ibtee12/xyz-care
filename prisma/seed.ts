import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, UserRole, CourseType } from "@prisma/client"
import bcrypt from "bcryptjs"

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set.")
}

const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Starting database seed...")

  const passwordHash = await bcrypt.hash("password123", 10)

  // 1. Admin
  const admin = await db.user.upsert({
    where: { email: "admin@xyzcare.com" },
    update: { role: UserRole.admin },
    create: {
      name: "Super Admin",
      email: "admin@xyzcare.com",
      password: passwordHash,
      role: UserRole.admin,
      phone: "+8801711000001",
    },
  })
  console.log("✅ Admin user ready:", admin.email)

  // 2. Teacher
  const teacher = await db.user.upsert({
    where: { email: "teacher@xyzcare.com" },
    update: { role: UserRole.teacher },
    create: {
      name: "Kawsar Hossain Kanak",
      email: "teacher@xyzcare.com",
      password: passwordHash,
      role: UserRole.teacher,
      phone: "+8801711000002",
      institution: "Rajshahi College",
    },
  })
  console.log("✅ Teacher user ready:", teacher.email)

  // 3. Student
  const student = await db.user.upsert({
    where: { email: "student@xyzcare.com" },
    update: { role: UserRole.student },
    create: {
      name: "Arif Hossain",
      email: "student@xyzcare.com",
      password: passwordHash,
      role: UserRole.student,
      roll_number: "M-1001",
      phone: "+8801711000003",
      classLevel: "HSC 2nd Year",
      institution: "Rajshahi College",
      student_batch: "HSC-2025",
    },
  })
  console.log("✅ Student user ready:", student.email)

  // 4. Courses
  const course1 = await db.course.upsert({
    where: { slug: "hsc-mathematics-full-course" },
    update: { instructor_id: teacher.id, is_published: true },
    create: {
      title: "HSC Mathematics Full Course",
      slug: "hsc-mathematics-full-course",
      description: "Complete preparation for HSC higher math covering calculus, algebra, and coordinate geometry.",
      price: 2500,
      course_type: CourseType.online,
      instructor_id: teacher.id,
      is_published: true,
    },
  })

  const course2 = await db.course.upsert({
    where: { slug: "algebra-and-calculus-bootcamp" },
    update: { instructor_id: teacher.id, is_published: true },
    create: {
      title: "Algebra & Calculus Bootcamp",
      slug: "algebra-and-calculus-bootcamp",
      description: "Intensive weekend offline workshop at our Rajshahi campus.",
      price: 1800,
      course_type: CourseType.offline,
      location: "Matrix Campus, Greater Road, Rajshahi",
      schedule: "Fri & Sat, 3:00 PM - 5:00 PM",
      instructor_id: teacher.id,
      is_published: true,
    },
  })
  console.log("✅ Courses seeded:", course1.title, ",", course2.title)

  // 5. Lessons
  const lesson1 = await db.lesson.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      course_id: course1.id,
      title: "Introduction to Limits and Continuity",
      description: "Foundational concepts of calculus with graphical intuition.",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: 1800,
      order: 1,
    },
  })

  await db.lesson.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      course_id: course1.id,
      title: "Derivatives: First Principles & Formulas",
      description: "Mastering differentiation techniques for polynomials and trigonometric functions.",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: 2400,
      order: 2,
    },
  })

  // 6. Enrollment
  await db.enrollment.upsert({
    where: {
      student_id_course_id: {
        student_id: student.id,
        course_id: course1.id,
      },
    },
    update: { progress: 50 },
    create: {
      student_id: student.id,
      course_id: course1.id,
      progress: 50,
    },
  })

  // Lesson progress
  await db.lessonProgress.upsert({
    where: {
      student_id_lesson_id: {
        student_id: student.id,
        lesson_id: lesson1.id,
      },
    },
    update: { is_completed: true },
    create: {
      student_id: student.id,
      lesson_id: lesson1.id,
      is_completed: true,
    },
  })

  // 7. Exam & Marks
  const exam = await db.exam.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      title: "Calculus Midterm Assessment",
      subject: "Higher Mathematics",
      total_marks: 50,
      exam_date: new Date(),
      created_by: admin.id,
    },
  })

  await db.studentMark.upsert({
    where: {
      exam_id_student_id: {
        exam_id: exam.id,
        student_id: student.id,
      },
    },
    update: { marks_obtained: 46 },
    create: {
      exam_id: exam.id,
      student_id: student.id,
      roll_number: "M-1001",
      marks_obtained: 46,
      remarks: "Outstanding clarity in calculus problems.",
    },
  })

  // 8. Blog post
  await db.blogPost.upsert({
    where: { slug: "mastering-hsc-calculus-tips" },
    update: {},
    create: {
      title: "Mastering HSC Calculus: 5 Strategic Tips",
      slug: "mastering-hsc-calculus-tips",
      content: "Calculus is often considered the most demanding topic in HSC Higher Mathematics. Here are 5 practical tips to boost your confidence and accuracy...",
      author_id: teacher.id,
      is_published: true,
      published_at: new Date(),
    },
  })

  console.log("\n🎉 Database seeded successfully!")
  console.log("-----------------------------------------")
  console.log("Credentials (all password: password123):")
  console.log("Admin:   admin@xyzcare.com")
  console.log("Teacher: teacher@xyzcare.com")
  console.log("Student: student@xyzcare.com")
  console.log("-----------------------------------------")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
