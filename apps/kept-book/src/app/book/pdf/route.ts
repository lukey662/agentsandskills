import { redirect } from "next/navigation";
import { renderCookbookPdf } from "@/lib/pdf";
import { getActiveSession } from "@/lib/session";
import { getBook, listRecipes } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const book = await getBook(active.household.id);
  if (!book) redirect("/box");
  const recipes = await listRecipes(active.household.id);
  const pdf = await renderCookbookPdf({ household: active.household, book, recipes });
  const filename = `${book.title.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "kept-book"}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
