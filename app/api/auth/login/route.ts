import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email va parol kiritilishi shart" }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();

    // Student login
    if (role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { email: cleanEmail } });
      if (!student) return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
      const valid = await verifyPassword(password, student.passwordHash);
      if (!valid) return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
      const token = await createToken({ id: student.id, email: student.email, name: `${student.firstName} ${student.lastName}`, role: "STUDENT" });
      const response = NextResponse.json({ user: { id: student.id, firstName: student.firstName, lastName: student.lastName, email: student.email, role: "STUDENT" } });
      response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
      return response;
    }

    // Teacher / Admin login
    const teacher = await prisma.teacher.findUnique({ where: { email: cleanEmail } });
    if (!teacher) return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    const valid = await verifyPassword(password, teacher.passwordHash);
    if (!valid) return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
    const token = await createToken({ id: teacher.id, email: teacher.email, name: teacher.name, role: teacher.role as "TEACHER" | "ADMIN" });
    const response = NextResponse.json({ user: { id: teacher.id, email: teacher.email, name: teacher.name, role: teacher.role } });
    response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
