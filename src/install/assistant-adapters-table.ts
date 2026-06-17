/** Extract a markdown table row from ASSISTANT_ADAPTERS.md by tool label in the first column. */
export function extractAssistantAdapterRow(adaptersDoc: string, toolLabel: string): string | null {
  for (const line of adaptersDoc.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells[0] === toolLabel) return trimmed;
  }
  return null;
}

/** True when the Instruction status column (3rd cell) is Active and not TBD. */
export function assistantAdapterRowIsActive(adaptersDoc: string, toolLabel: string): boolean {
  const row = extractAssistantAdapterRow(adaptersDoc, toolLabel);
  if (!row) return false;
  const cells = row
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);
  const instructionStatus = cells[2] ?? "";
  return /^Active/i.test(instructionStatus) && !/^TBD/i.test(instructionStatus);
}
