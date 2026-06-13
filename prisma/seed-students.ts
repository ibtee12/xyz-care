import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set.");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

// --- Rajshahi-based institutions only ---
const rajshahiInstitutions = [
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
  "Rajshahi Railway Junior High School",
  "Rajshahi Tech School and College",
  "Rajshahi Metropolitan Police Lines Girls High School",
  "Rajshahi Govt Deaf and Blind School",
  "Rajshahi Bagha High School",
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
  "Rural Development Academy (Rda) School",
];

// --- Realistic Bangladeshi names ---
const firstNames = [
  "Arif", "Raihan", "Nusrat", "Fatima", "Tanvir", "Shafiq", "Mariam", "Imran",
  "Shakil", "Riya", "Hasan", "Mehedi", "Priya", "Sadia", "Tamim", "Sabbir",
  "Nazmul", "Tanjina", "Kamrul", "Rima", "Farhan", "Jannatul", "Ashfaq", "Lamia",
  "Sajid", "Tasneem", "Zubair", "Anika", "Rakib", "Sumaiya", "Mahfuz", "Nadia",
  "Shahriar", "Tasnim", "Jubayer", "Fariha", "Habib", "Israt", "Mushfiq", "Reshma",
  "Touhid", "Shabnaz", "Zahid", "Rumana", "Shihab", "Laboni", "Rifat", "Mithila",
  "Sohel", "Farzana", "Kabir", "Halima", "Nafis", "Shamima", "Rayhan", "Munira",
  "Anwar", "Rubina", "Saiful", "Tahmina", "Masum", "Salma", "Ashraf", "Dina",
  "Jamal", "Kohinoor", "Rashed", "Lubna", "Kamal", "Nahida", "Minhaz", "Parvin",
  "Emon", "Shapla", "Sumon", "Rukaiya", "Fahim", "Nilufer", "Firoz", "Kaniz",
];

const lastNames = [
  "Hossain", "Rahman", "Islam", "Akter", "Ahmed", "Begum", "Khan", "Khatun",
  "Miah", "Chowdhury", "Uddin", "Sultana", "Alam", "Khandaker", "Sarker", "Das",
  "Ali", "Jahan", "Siddique", "Parveen", "Kabir", "Nahar", "Bhuiyan", "Mostafa",
  "Haque", "Yasmin", "Talukder", "Roy", "Mahmud", "Noor", "Rana", "Zaman",
];

const classLevels = [
  "Class 9", "Class 10",
  "HSC 1st Year", "HSC 2nd Year",
  "Admission (Medical)", "Admission (Varsity)", "Admission (Engineering)",
];

const phonePrefixes = ["017", "018", "019", "016", "015", "013"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefix = pick(phonePrefixes);
  const rest = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `+880${prefix}${rest.slice(0, 8)}`;
}

async function main() {
  console.log("🚀 Seeding 100 students for Matrix Math Care...\n");

  // First, get current student count so MatrixIDs continue properly
  const existingCount = await db.user.count({ where: { role: UserRole.student } });
  console.log(`📊 Existing students: ${existingCount}`);

  const defaultPassword = "student123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const students: {
    name: string;
    email: string;
    password: string;
    phone: string;
    roll_number: string;
    classLevel: string;
    institution: string;
    role: UserRole;
  }[] = [];

  const usedEmails = new Set<string>();

  for (let i = 0; i < 100; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;

    // Create a unique email
    let email: string;
    let attempt = 0;
    do {
      const suffix = attempt === 0 ? "" : attempt.toString();
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@student.matrixmath.com`;
      attempt++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const matrixId = `M-${(existingCount + i + 1).toString().padStart(4, "0")}`;
    const classLevel = pick(classLevels);
    const institution = pick(rajshahiInstitutions);
    const phone = generatePhone();

    students.push({
      name,
      email,
      password: hashedPassword,
      phone,
      roll_number: matrixId,
      classLevel,
      institution,
      role: UserRole.student,
    });
  }

  // Insert in batches of 20 to avoid overwhelming the DB
  const batchSize = 20;
  let created = 0;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);

    // Use createMany with skipDuplicates so existing emails won't crash
    const result = await db.user.createMany({
      data: batch,
      skipDuplicates: true,
    });

    created += result.count;
    console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1}: inserted ${result.count} students`);
  }

  console.log(`\n🎉 Done! Created ${created} new students.`);
  console.log(`📧 All students use password: "${defaultPassword}"`);
  console.log(`🆔 MatrixIDs range: M-${(existingCount + 1).toString().padStart(4, "0")} → M-${(existingCount + 100).toString().padStart(4, "0")}`);

  // Print a sample of 5 students
  console.log("\n📋 Sample students:");
  for (const s of students.slice(0, 5)) {
    console.log(`   ${s.roll_number} | ${s.name.padEnd(25)} | ${s.classLevel.padEnd(14)} | ${s.institution}`);
  }

  await db.$disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
