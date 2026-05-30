import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed boshlandi...");

  // Admin
  const adminExists = await prisma.teacher.findUnique({ where: { email: "admin@writingcd.uz" } });
  if (!adminExists) {
    await prisma.teacher.create({
      data: { email: "admin@writingcd.uz", passwordHash: await bcrypt.hash("Admin@12345", 12), name: "Super Admin", role: "ADMIN" },
    });
    console.log("✅ Admin: admin@writingcd.uz / Admin@12345");
  }

  // Teacher
  const teacherExists = await prisma.teacher.findUnique({ where: { email: "teacher@writingcd.uz" } });
  if (!teacherExists) {
    await prisma.teacher.create({
      data: { email: "teacher@writingcd.uz", passwordHash: await bcrypt.hash("Teacher@123", 12), name: "Aziz Karimov", role: "TEACHER" },
    });
    console.log("✅ Teacher: teacher@writingcd.uz / Teacher@123");
  }

  // Tests
  const testCount = await prisma.test.count();
  if (testCount === 0) {
    await prisma.test.createMany({
      data: [
        { type: "Task 1", title: "Bamboo Fabric Manufacturing", prompt: "The diagram below shows how fabric is manufactured from bamboo. Summarise the information by selecting and reporting the main features, and make comparisons where relevant." },
        { type: "Task 2", title: "Technology and Education", prompt: "Some people believe that technology has made education better, while others think it has created new problems. Discuss both views and give your own opinion." },
      ],
    });
    console.log("✅ 2 ta demo test yaratildi");
  }

  console.log("🎉 Seed tugadi!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
