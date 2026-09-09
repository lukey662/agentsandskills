import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { CopyInvite } from "@/components/copy-invite";
import type { Household, Member } from "@/lib/types";

export function KitchenHeader({ household, member }: { household: Household; member: Member }) {
  return (
    <header className="kitchen-bar">
      <a className="skip-link" href="#main">
        Skip to the box
      </a>
      <p className="kitchen-name">
        <Link href="/box">{household.name}</Link>
      </p>
      <p className="kitchen-member">Cards from {member.displayName}</p>
      <nav className="kitchen-nav" aria-label="Kitchen">
        <Link href="/box">The box</Link>
        <Link href="/recipes/new">Write a card</Link>
        <Link href="/book">The book</Link>
      </nav>
      <CopyInvite code={household.inviteCode} />
      <form action={signOutAction}>
        <button type="submit" className="text-btn">
          Leave kitchen
        </button>
      </form>
    </header>
  );
}
