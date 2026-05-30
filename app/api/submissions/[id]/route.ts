import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN"))
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { id } = await params;
    const { teacherScore, teacherFeedback } = await req.json();

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        teacherScore: teacherScore ?? undefined,
        teacherFeedback: teacherFeedback ?? undefined,
        teacherId: user.id,
        status: teacherScore !== undefined && teacherScore !== null ? "APPROVED" : undefined,
      },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        test: { select: { id: true, type: true, title: true } },
        teacher: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ submission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
