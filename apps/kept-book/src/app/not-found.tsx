import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell">
      <main>
        <h1 className="mast">That card is not in this box</h1>
        <p>
          It may belong to another kitchen, or it was never written. <Link href="/box">Back to the box</Link>.
        </p>
      </main>
    </div>
  );
}
