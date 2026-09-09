import { notFound, redirect } from "next/navigation";
import { updateRecipeAction } from "@/app/actions";
import { KitchenHeader } from "@/components/kitchen-header";
import { RecipeForm } from "@/components/recipe-form";
import { messageFor } from "@/lib/errors";
import { getActiveSession } from "@/lib/session";
import { getRecipe } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params, searchParams }: PageProps<"/recipes/[id]/edit">) {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const { id } = await params;
  const recipe = await getRecipe(active.household.id, id);
  if (!recipe) notFound();
  const query = await searchParams;
  const error = messageFor(typeof query.error === "string" ? query.error : undefined);
  const action = updateRecipeAction.bind(null, recipe.id);

  return (
    <div className="shell">
      <KitchenHeader household={active.household} member={active.member} />
      <main id="main">
        <h1 className="mast" style={{ fontSize: "2.4rem" }}>
          Edit {recipe.title}
        </h1>
        <RecipeForm action={action} recipe={recipe} error={error} />
      </main>
    </div>
  );
}
