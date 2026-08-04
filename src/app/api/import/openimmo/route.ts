import { NextResponse } from "next/server";
import { parseOpenImmoUpload } from "@/lib/openimmo/parse-openimmo";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xml") && !lower.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload .xml or .zip." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const properties = await parseOpenImmoUpload(buffer, file.name);

    return NextResponse.json({ ok: true, data: properties, count: properties.length });
  } catch (err) {
    console.error("[api/import/openimmo]", err);
    const message =
      err instanceof Error ? err.message : "Failed to parse OpenImmo file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
