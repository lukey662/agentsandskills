import { joinKitchenAction, openKitchenAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { messageFor } from "@/lib/errors";
import { getActiveSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const active = await getActiveSession();
  if (active) redirect("/box");
  const params = await searchParams;
  const error = messageFor(typeof params.error === "string" ? params.error : undefined);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to open a kitchen
      </a>
      <header>
        <p style={{ margin: 0, fontWeight: 600 }}>Kept Book</p>
      </header>
      <main id="main" className="home-grid">
        <section>
          <h1 className="mast">The recipes that live in this kitchen.</h1>
          <p className="lede">
            Write the cards your household still cooks from. Invite the people who belong at this table. When you want copies on the
            counter, download a print PDF — or send that file to Gelato for a hardcover.
          </p>
          {error ? (
            <p className="banner" role="alert">
              {error}
            </p>
          ) : null}
          <form action={openKitchenAction} className="door">
            <h2>Open this kitchen</h2>
            <label>
              Kitchen name
              <input name="name" required maxLength={80} placeholder="The Parkers, 14 Oak" autoComplete="organization" />
            </label>
            <label>
              Your name on the cards
              <input name="displayName" required maxLength={60} autoComplete="name" />
            </label>
            <SubmitButton pendingLabel="Opening…">Open this kitchen</SubmitButton>
          </form>
        </section>
        <section>
          <form action={joinKitchenAction} className="door">
            <h2>Join with a code</h2>
            <p style={{ margin: 0 }}>Someone already opened the box. Use the eight-character invite from their kitchen bar.</p>
            <label>
              Invite code
              <input name="inviteCode" required maxLength={16} autoComplete="off" spellCheck={false} />
            </label>
            <label>
              Your name
              <input name="displayName" required maxLength={60} autoComplete="name" />
            </label>
            <SubmitButton pendingLabel="Joining…">Join this kitchen</SubmitButton>
          </form>
        </section>
      </main>
      <p style={{ marginTop: "2rem", maxWidth: "40rem" }}>
        Not Mixbook. Not a public recipe feed. The box is private to the invite. Print is a PDF first; a Gelato hardcover is the bound
        copy when you want one.
      </p>
    </div>
  );
}
