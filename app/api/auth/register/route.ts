import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();
    if (!firstName || !lastName || !email || !password)
      return NextResponse.json({ error: "Barcha maydonlar majburiy" }, { status: 400 });

    const exists = await prisma.student.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 400 });

    const student = await prisma.student.create({
      data: { firstName: firstName.trim(), lastName: lastName.trim(), email: email.toLowerCase().trim(), passwordHash: await hashPassword(password) },
    });

    const token = await createToken({ id: student.id, email: student.email, name: `${student.firstName} ${student.lastName}`, role: "STUDENT" });
    const response = NextResponse.json({ user: { id: student.id, firstName: student.firstName, lastName: student.lastName, email: student.email, role: "STUDENT" } });
    response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Server xatosi: " + error.message }, { status: 500 });
  }
}
