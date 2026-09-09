import Link from "next/link";
import { redirect } from "next/navigation";
import { COURSE_LABEL } from "@/lib/types";
import { getActiveSession } from "@/lib/session";
import { getBook, listRecipes, recipesForBook } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PrintPage() {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const book = await getBook(active.household.id);
  if (!book) redirect("/box");
  const recipes = recipesForBook(await listRecipes(active.household.id));

  return (
    <div className="print-page">
      <p className="no-print shell" style={{ paddingBottom: 0 }}>
        <Link href="/book">Back to the book desk</Link>
        {" · "}
        <a href="/book/pdf">Download PDF</a>
        {" · "}
        Use the browser print dialog and choose Save as PDF if you want a second copy.
      </p>
      <article className="print-sheet">
        <section className="print-cover">
          <p>Kept Book</p>
          <h1 className="mast">{book.title}</h1>
          {book.dedication ? <p className="lede">{book.dedication}</p> : null}
          <p>
            {recipes.length} cards from the {active.household.name} box.
          </p>
        </section>
        <section className="print-recipe">
          <h2>Cards in this book</h2>
          <ol>
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                {COURSE_LABEL[recipe.course]} — {recipe.title} ({recipe.fromWhom})
              </li>
            ))}
          </ol>
        </section>
        {recipes.map((recipe) => (
          <section key={recipe.id} className="print-recipe">
            <p className="tab">{COURSE_LABEL[recipe.course]}</p>
            <h2>{recipe.title}</h2>
            <p>From the kitchen of {recipe.fromWhom}</p>
            {recipe.servings ? <p>{recipe.servings}</p> : null}
            {recipe.story ? <p>{recipe.story}</p> : null}
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ul>
            <h3>Method</h3>
            <ol>
              {recipe.steps.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
            {recipe.notes ? <p>{recipe.notes}</p> : null}
          </section>
        ))}
      </article>
    </div>
  );
}
