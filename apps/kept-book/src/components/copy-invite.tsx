"use client";

import { useState } from "react";

export function CopyInvite({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="invite-copy" onClick={() => void copy()}>
      Invite {code}
      <span className="invite-copy-hint">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
