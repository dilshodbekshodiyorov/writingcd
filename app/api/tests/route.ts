import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const tests = await prisma.test.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ tests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN"))
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { type, title, prompt, imageUrl } = await req.json();
    if (!type || !title || !prompt) return NextResponse.json({ error: "Maydonlar majburiy" }, { status: 400 });

    const test = await prisma.test.create({ data: { type, title: title.trim(), prompt: prompt.trim(), imageUrl: imageUrl ?? null } });
    return NextResponse.json({ test }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN"))
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID kerak" }, { status: 400 });

    await prisma.test.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
