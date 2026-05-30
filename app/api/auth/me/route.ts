import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Kirmagansiz" }, { status: 401 });

  // Student uchun firstName/lastName ham qaytaramiz
  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { id: user.id }, select: { id: true, firstName: true, lastName: true, email: true } });
    if (!student) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json({ user: { ...student, role: "STUDENT" } });
  }

  return NextResponse.json({ user });
}
