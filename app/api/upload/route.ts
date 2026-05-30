import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("=== UPLOAD BOSHLANDI ===");
    console.log("URL:", supabaseUrl);
    console.log("KEY:", serviceKey?.slice(0, 20));

    if (!supabaseUrl || !serviceKey) {
      console.log("ENV YOQLIGI!");
      return NextResponse.json({ error: "Supabase sozlanmagan" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    console.log("FAYL:", file?.name, file?.size);

    if (!file) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });

    const ext = file.name.split(".").pop();
    const fileName = `test-images/${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();

    // Supabase REST API orqali yuklash
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/writingcd/${fileName}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: buffer,
      }
    );

    console.log("SUPABASE STATUS:", uploadRes.status);
    const uploadData = await uploadRes.text();
    console.log("SUPABASE RESPONSE:", uploadData);

    if (!uploadRes.ok) {
      return NextResponse.json({ error: "Upload xatosi: " + uploadData }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/writingcd/${fileName}`;
    console.log("PUBLIC URL:", publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("UPLOAD CATCH:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}