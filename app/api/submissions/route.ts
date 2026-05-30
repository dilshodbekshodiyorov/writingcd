import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Kirmagansiz" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    // Student faqat o'zining ishlarini ko'radi
    if (user.role === "STUDENT") {
      const submissions = await prisma.submission.findMany({
        where: { studentId: user.id },
        include: { test: { select: { type: true, title: true } } },
        orderBy: { submittedAt: "desc" },
      });
      return NextResponse.json({ submissions });
    }

    // Teacher/Admin — agar studentId berilsa filterlaydi
    const submissions = await prisma.submission.findMany({
      where: studentId ? { studentId } : {},
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        test: { select: { id: true, type: true, title: true } },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT")
      return NextResponse.json({ error: "Faqat o'quvchilar yuborishi mumkin" }, { status: 401 });

    const { testId, text } = await req.json();
    if (!testId || !text?.trim()) return NextResponse.json({ error: "testId va text majburiy" }, { status: 400 });

    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) return NextResponse.json({ error: "Test topilmadi" }, { status: 404 });

    const submission = await prisma.submission.create({
      data: { testId, studentId: user.id, text: text.trim(), status: "PENDING" },
      include: { test: { select: { type: true, title: true } } },
    });
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
