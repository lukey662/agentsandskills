import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { KitchenHeader } from "@/components/kitchen-header";
import { getActiveSession } from "@/lib/session";
import { getRecipe } from "@/lib/store";
import { COURSE_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: PageProps<"/recipes/[id]">) {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const { id } = await params;
  const recipe = await getRecipe(active.household.id, id);
  if (!recipe) notFound();

  return (
    <div className="shell">
      <KitchenHeader household={active.household} member={active.member} />
      <main id="main" className="recipe-sheet">
        <p className="tab">{COURSE_LABEL[recipe.course]}</p>
        <h1>{recipe.title}</h1>
        <p className="from">From the kitchen of {recipe.fromWhom}</p>
        {recipe.servings ? <p>{recipe.servings}</p> : null}
        {recipe.story ? <p className="story">{recipe.story}</p> : null}
        <p>
          <Link href={`/recipes/${recipe.id}/edit`}>Edit this card</Link>
        </p>
        <div className="recipe-body">
          <section>
            <h2>Ingredients</h2>
            <ul>
              {recipe.ingredients.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Method</h2>
            <ol>
              {recipe.steps.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
          </section>
        </div>
        {recipe.notes ? (
          <p className="story" style={{ marginTop: "1rem" }}>
            {recipe.notes}
          </p>
        ) : null}
      </main>
    </div>
  );
}
