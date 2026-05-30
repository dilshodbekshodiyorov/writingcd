import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

    const [totalSubmissions, pendingCount, approvedCount, totalTests, totalTeachers, totalStudents] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "PENDING" } }),
      prisma.submission.count({ where: { status: "APPROVED" } }),
      prisma.test.count(),
      prisma.teacher.count({ where: { role: "TEACHER" } }),
      prisma.student.count(),
    ]);

    return NextResponse.json({ stats: { totalSubmissions, pendingCount, approvedCount, totalTests, totalTeachers, totalStudents } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
