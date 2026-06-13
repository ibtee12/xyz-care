const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const cs = "postgresql://postgres.wqcxkfzfpfjsxfgdtvkr:ibteeIBTEE123!!!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: cs }) });

async function main() {
  const pw = bcrypt.hashSync("password123", 10);

  // ── Resolve admin (courses need an instructor_id) ──────────────
  const admin = await db.user.findFirst({ where: { role: "admin" } });
  if (!admin) throw new Error("No admin user found. Create an admin account first.");
  console.log("Admin:", admin.email);

  // ── Courses ───────────────────────────────────────────────────
  console.log("Creating courses...");
  const coursesData = [
    { title: "HSC Mathematics Full Course",  slug: "hsc-mathematics-full-course",    price: 2500, course_type: "online"  },
    { title: "SSC Physics and Chemistry",    slug: "ssc-physics-and-chemistry",       price: 1800, course_type: "online"  },
    { title: "Algebra and Calculus Bootcamp",slug: "algebra-and-calculus-bootcamp",   price: 1200, course_type: "offline" },
    { title: "Advanced Trigonometry",        slug: "advanced-trigonometry",           price:  900, course_type: "online"  },
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await db.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        title: c.title,
        slug: c.slug,
        description: `A comprehensive course on ${c.title} for competitive exam preparation.`,
        instructor_id: admin.id,
        price: c.price,
        course_type: c.course_type,
        is_published: true,
      },
    });
    courses.push(course);
    console.log(" ", course.title);
  }

  // ── Students ──────────────────────────────────────────────────
  console.log("Creating students...");
  const studentData = [
    { name: "Arif Hossain",    email: "arif@student.com",    roll: "M-2201" },
    { name: "Tania Akter",     email: "tania@student.com",   roll: "M-2202" },
    { name: "Rakib Uddin",     email: "rakib@student.com",   roll: "M-2203" },
    { name: "Sumaiya Islam",   email: "sumaiya@student.com", roll: "M-2204" },
    { name: "Jahid Hassan",    email: "jahid@student.com",   roll: "M-2205" },
    { name: "Mitu Begum",      email: "mitu@student.com",    roll: "M-2206" },
    { name: "Nafis Ahmed",     email: "nafis@student.com",   roll: "M-2207" },
    { name: "Puja Sarker",     email: "puja@student.com",    roll: "M-2208" },
    { name: "Imran Khan",      email: "imran@student.com",   roll: "M-2209" },
    { name: "Fatema Khanam",   email: "fatema@student.com",  roll: "M-2210" },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await db.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, password: pw, role: "student", roll_number: s.roll },
    });
    students.push(student);
    console.log(" ", student.name, `(${student.roll_number})`);
  }

  // ── Enrollments ───────────────────────────────────────────────
  console.log("Enrolling students...");
  const plan = [
    { course: courses[0], idx: [0,1,2,3,4,5,6] },
    { course: courses[1], idx: [1,2,3,4,7,8,9] },
    { course: courses[2], idx: [0,3,5,6,8,9]   },
    { course: courses[3], idx: [0,1,4,5,7,8]   },
  ];

  for (const p of plan) {
    for (const i of p.idx) {
      await db.enrollment.upsert({
        where: { student_id_course_id: { student_id: students[i].id, course_id: p.course.id } },
        update: {},
        create: { student_id: students[i].id, course_id: p.course.id, progress: 0 },
      });
    }
    console.log(`  ${p.idx.length} students → "${p.course.title}"`);
  }

  console.log("\n✅ Done!");
  console.log("   Students: arif@student.com … fatema@student.com");
  console.log("   All student passwords: password123");
}

main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => db.$disconnect());
