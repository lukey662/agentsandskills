import Link from "next/link";
import { addSampleCardsAction } from "@/app/actions";
import { KitchenHeader } from "@/components/kitchen-header";
import { RecipeIndexCard } from "@/components/recipe-index-card";
import { SubmitButton } from "@/components/submit-button";
import { messageFor } from "@/lib/errors";
import { getActiveSession } from "@/lib/session";
import { listRecipes } from "@/lib/store";
import { COURSES, COURSE_LABEL, type Course } from "@/lib/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BoxPage({ searchParams }: PageProps<"/box">) {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const params = await searchParams;
  const courseParam = typeof params.course === "string" ? params.course : "all";
  const course = (COURSES as readonly string[]).includes(courseParam) ? (courseParam as Course) : "all";
  const recipes = await listRecipes(active.household.id);
  const visible = course === "all" ? recipes : recipes.filter((recipe) => recipe.course === course);
  const error = messageFor(typeof params.error === "string" ? params.error : undefined);

  return (
    <div className="shell">
      <KitchenHeader household={active.household} member={active.member} />
      <main id="main">
        <div className="toolbar">
          <h1 style={{ margin: 0, fontFamily: "var(--font-display), Georgia, serif", fontSize: "2rem" }}>The box</h1>
          <Link href="/recipes/new" className="btn-primary" style={{ textDecoration: "none" }}>
            Write a card
          </Link>
          {recipes.length === 0 ? (
            <form action={addSampleCardsAction}>
              <SubmitButton pendingLabel="Adding samples…">Add three sample cards</SubmitButton>
            </form>
          ) : null}
        </div>
        {error ? (
          <p className="banner" role="alert">
            {error}
          </p>
        ) : null}
        <nav className="tabs" aria-label="Recipe sections">
          <Link href="/box" aria-current={course === "all" ? "page" : undefined}>
            All
          </Link>
          {COURSES.map((value) => (
            <Link key={value} href={`/box?course=${value}`} aria-current={course === value ? "page" : undefined}>
              {COURSE_LABEL[value]}
            </Link>
          ))}
        </nav>
        {visible.length === 0 ? (
          <div className="empty">
            <p>This box is empty. Write the first card — the one you still make from memory.</p>
            <p>
              <Link href="/recipes/new">Write a card</Link>
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {visible.map((recipe) => (
              <RecipeIndexCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
