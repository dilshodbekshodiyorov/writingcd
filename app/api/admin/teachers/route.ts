import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

    const teachers = await prisma.teacher.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ teachers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

    const { email, name, password } = await req.json();
    if (!email || !name || !password) return NextResponse.json({ error: "Barcha maydonlar majburiy" }, { status: 400 });

    const exists = await prisma.teacher.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return NextResponse.json({ error: "Bu email allaqachon mavjud" }, { status: 400 });

    const teacher = await prisma.teacher.create({
      data: { email: email.toLowerCase().trim(), name: name.trim(), passwordHash: await hashPassword(password), role: "TEACHER" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
