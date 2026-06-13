import { db } from "@/lib/db"

export async function teacherOwnsCourse(teacherId: string, courseId: string) {
  const course = await db.course.findFirst({
    where: { id: courseId, instructor_id: teacherId },
    select: { id: true },
  })
  return course !== null
}

export async function studentEnrolledInTeacherCourse(teacherId: string, studentId: string) {
  const count = await db.enrollment.count({
    where: {
      student_id: studentId,
      course: { instructor_id: teacherId },
    },
  })
  return count > 0
}
