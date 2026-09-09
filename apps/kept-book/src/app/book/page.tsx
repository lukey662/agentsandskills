import Link from "next/link";
import { redirect } from "next/navigation";
import { updateBookAction } from "@/app/actions";
import { KitchenHeader } from "@/components/kitchen-header";
import { SubmitButton } from "@/components/submit-button";
import { messageFor } from "@/lib/errors";
import { gelatoConfigured } from "@/lib/pdf";
import { getActiveSession } from "@/lib/session";
import { getBook, listRecipes, recipesForBook } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const active = await getActiveSession();
  if (!active) redirect("/?error=not-signed-in");
  const book = await getBook(active.household.id);
  if (!book) redirect("/box");
  const recipes = recipesForBook(await listRecipes(active.household.id));
  const params = await searchParams;
  const error = messageFor(typeof params.error === "string" ? params.error : undefined);
  const gelato = gelatoConfigured();

  return (
    <div className="shell">
      <KitchenHeader household={active.household} member={active.member} />
      <main id="main">
        <h1 className="mast" style={{ fontSize: "2.6rem" }}>
          The book
        </h1>
        <p className="lede">
          Same cards as the box, in book order. Download a PDF for the library printer, or keep it for Gelato. Live Gelato checkout
          waits on a public URL and an API key.
        </p>
        {error ? (
          <p className="banner" role="alert">
            {error}
          </p>
        ) : null}
        <form action={updateBookAction} className="door" style={{ maxWidth: "36rem" }}>
          <h2>Cover</h2>
          <label>
            Book title
            <input name="title" required maxLength={80} defaultValue={book.title} />
          </label>
          <label>
            Dedication
            <textarea name="dedication" rows={3} maxLength={400} defaultValue={book.dedication} placeholder="For the people who still ask for the pan bread." />
          </label>
          <SubmitButton pendingLabel="Saving cover…">Save cover</SubmitButton>
        </form>
        <div className="book-actions">
          <Link href="/book/print" className="btn-quiet" style={{ textDecoration: "none" }}>
            Preview print pages
          </Link>
          <a className="btn-primary" href="/book/pdf" style={{ textDecoration: "none" }}>
            Download print PDF
          </a>
        </div>
        <section className="door">
          <h2>Gelato hardcover</h2>
          {gelato ? (
            <p>
              A Gelato API key is set on this server. Gelato still needs a public PDF URL (this app on the internet, or a file host).
              Download the PDF and upload it in Gelato Create as a photobook until that URL exists.
            </p>
          ) : (
            <p>
              No <code>GELATO_API_KEY</code> on this server — by design, not a missing feature in the kitchen. Download the PDF,
              then either upload it in{" "}
              <a href="https://www.gelato.com/" rel="noreferrer">
                Gelato Create
              </a>{" "}
              as a photobook, or add the key after Kept Book has a public URL.
            </p>
          )}
        </section>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Pages</h2>
        {recipes.length === 0 ? (
          <p>
            No cards yet. <Link href="/recipes/new">Write one</Link> before you print.
          </p>
        ) : (
          <ol>
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link> — {recipe.fromWhom}
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
