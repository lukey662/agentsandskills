import { createRecipeAction } from "@/app/actions";
import { KitchenHeader } from "@/components/kitchen-header";
import { RecipeForm } from "@/components/recipe-form";
import { messageFor } from "@/lib/errors";
import { getActiveSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewRecipePage({ searchParams }: PageProps<"/recipes/new">) {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const params = await searchParams;
  const error = messageFor(typeof params.error === "string" ? params.error : undefined);

  return (
    <div className="shell">
      <KitchenHeader household={active.household} member={active.member} />
      <main id="main">
        <h1 className="mast" style={{ fontSize: "2.4rem" }}>
          Write a card
        </h1>
        <p className="lede">One recipe. Whose kitchen. The way this house actually cooks it.</p>
        <RecipeForm action={createRecipeAction} error={error} />
      </main>
    </div>
  );
}
