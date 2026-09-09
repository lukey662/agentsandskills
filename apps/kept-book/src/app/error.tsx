"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell">
      <main>
        <h1 className="mast">The box jammed</h1>
        <p>Something failed on the server. The cards that already saved are still in the kitchen.</p>
        <button type="button" className="btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </main>
    </div>
  );
}
