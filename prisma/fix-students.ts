import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set.");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const VALID_CLASS_LEVELS = [
  "Class 9",
  "Class 10",
  "HSC 1st Year",
  "HSC 2nd Year",
  "Admission (Medical)",
  "Admission (Varsity)",
  "Admission (Engineering)",
];

const INVALID_CLASS_LEVELS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "BSc 1st Year",
  "BSc 2nd Year",
  "BSc 3rd Year",
  "BSc 4th Year",
  "SSC",
  "HSC",
  "Admission",
];

// Rajshahi schools/colleges only (no universities)
const RAJSHAHI_INSTITUTIONS = [
  "Rajshahi College",
  "Rajshahi Collegiate School",
  "Rajshahi Cadet College",
  "New Government Degree College, Rajshahi",
  "Rajshahi Government High School",
  "Rajshahi Cantonment School and College",
  "Rajshahi Education Board Model School",
  "Government Laboratory High School Rajshahi",
  "Biam Model School and College Rajshahi",
  "Rajshahi Model School and College",
  "Rajshahi University School",
  "Rajshahi Women's College School Section",
  "Rajshahi Govt City College School Section",
  "Rajshahi Tech School and College",
  "Rajshahi Metropolitan Police Lines Girls High School",
  "Government Azizul Haque College",
  "Godagari Pilot High School",
  "Godagari School and College",
  "Charghat Government High School",
  "Charghat High School",
  "Paba Pilot High School",
  "Putia Pilot High School",
  "Tanore Pilot High School",
  "Mohanpur Pilot High School",
  "Motihar High School",
  "Upasahar Girls High School",
  "Shaheed Smriti Govt High School",
  "Kazla High School",
  "Sapura High School",
  "Talaimari High School",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🔄 Fixing seeded students with invalid class levels and university institutions...\n");

  // Find students with invalid classLevel or university institutions
  const studentsToFix = await db.user.findMany({
    where: {
      role: UserRole.student,
      OR: [
        { classLevel: { in: INVALID_CLASS_LEVELS } },
        { institution: { contains: "University" } },
        { institution: { contains: "RUET" } },
        { institution: { contains: "RU)" } },
      ],
    },
    select: { id: true, name: true, classLevel: true, institution: true },
  });

  console.log(`📊 Found ${studentsToFix.length} students to fix.\n`);

  let fixedCount = 0;
  for (const student of studentsToFix) {
    const updates: { classLevel?: string; institution?: string } = {};

    if (student.classLevel && (INVALID_CLASS_LEVELS.includes(student.classLevel) || !VALID_CLASS_LEVELS.includes(student.classLevel))) {
      updates.classLevel = pick(VALID_CLASS_LEVELS);
    }

    const inst = student.institution || "";
    if (inst.includes("University") || inst.includes("RUET") || inst.includes("RU)")) {
      updates.institution = pick(RAJSHAHI_INSTITUTIONS);
    }

    if (Object.keys(updates).length > 0) {
      await db.user.update({
        where: { id: student.id },
        data: updates,
      });
      fixedCount++;
      console.log(`  ✅ ${student.name}: ${student.classLevel} → ${updates.classLevel || student.classLevel} | ${student.institution} → ${updates.institution || student.institution}`);
    }
  }

  console.log(`\n🎉 Done! Fixed ${fixedCount} students.`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error("❌ Fix failed:", err);
  process.exit(1);
});
