import { buildUserDataExport } from "@/lib/account/export-user-data";
import { getSupabaseAuthUser } from "@/lib/billing/access";

export const runtime = "nodejs";

export async function GET() {
  const authUser = await getSupabaseAuthUser();
  if (!authUser?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await buildUserDataExport(authUser.id);
    const body = JSON.stringify(payload, null, 2);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="my-data-export.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Data export failed.";
    console.error("[export-data]", err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
