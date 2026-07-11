import { randomUUID } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, openSync, closeSync, readFileSync, readdirSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { RunEvent, RunRecord, RunStatus } from "./types.js";
import { redactValue } from "./security/redaction.js";

export interface RunEventStore {
  create(record: RunRecord): RunRecord;
  read(runId: string): RunRecord;
  list(): RunRecord[];
  update(runId: string, patch: Partial<RunRecord>): RunRecord;
  append(runId: string, event: Omit<RunEvent, "schemaVersion" | "eventId" | "sequence" | "runId" | "createdAt">): RunEvent;
  events(runId: string): RunEvent[];
}

function atomicWrite(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, content, { mode: 0o600 });
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

function withFileLock<T>(path: string, operation: () => T): T {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  let descriptor: number | undefined;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      descriptor = openSync(path, "wx", 0o600);
      break;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
  if (descriptor === undefined) throw new Error(`Timed out acquiring runtime event lock: ${path}`);
  try {
    return operation();
  } finally {
    closeSync(descriptor);
    unlinkSync(path);
  }
}

export class FileRunEventStore implements RunEventStore {
  readonly root: string;

  constructor(cwd: string) {
    this.root = resolve(cwd, ".agent-kit", "runtime", "runs");
  }

  create(record: RunRecord): RunRecord {
    this.ensureRoot();
    return withFileLock(this.lockPath(record.runId), () => {
      const path = this.recordPath(record.runId);
      if (existsSync(path)) throw new Error(`Run already exists: ${record.runId}`);
      this.writeRecord(record);
      return record;
    });
  }

  read(runId: string): RunRecord {
    const path = this.recordPath(runId);
    if (!existsSync(path)) throw new Error(`Unknown run: ${runId}`);
    return JSON.parse(readFileSync(path, "utf8")) as RunRecord;
  }

  list(): RunRecord[] {
    if (!existsSync(this.root)) return [];
    return readdirSync(this.root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(this.root, entry.name, "run.json")))
      .map((entry) => this.read(entry.name))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  update(runId: string, patch: Partial<RunRecord>): RunRecord {
    return withFileLock(this.lockPath(runId), () => {
      const current = this.read(runId);
      const next = { ...current, ...patch, runId: current.runId, schemaVersion: 1 as const, updatedAt: new Date().toISOString() };
      this.writeRecord(next);
      return next;
    });
  }

  append(runId: string, event: Omit<RunEvent, "schemaVersion" | "eventId" | "sequence" | "runId" | "createdAt">): RunEvent {
    this.ensureRoot();
    return withFileLock(this.lockPath(runId), () => {
      const existing = this.events(runId);
      const next = redactValue({
        ...event,
        schemaVersion: 1,
        eventId: randomUUID(),
        sequence: (existing.at(-1)?.sequence ?? 0) + 1,
        runId,
        createdAt: new Date().toISOString()
      }) as RunEvent;
      const path = this.eventsPath(runId);
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
      appendFileSync(path, `${JSON.stringify(next)}\n`, { mode: 0o600 });
      return next;
    });
  }

  events(runId: string): RunEvent[] {
    const path = this.eventsPath(runId);
    if (!existsSync(path)) return [];
    const text = readFileSync(path, "utf8");
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .flatMap((line, index, lines) => {
        try {
          return [JSON.parse(line) as RunEvent];
        } catch (error) {
          if (index === lines.length - 1 && !text.endsWith("\n")) return [];
          throw error;
        }
      });
  }

  setStatus(runId: string, status: RunStatus, text?: string): RunRecord {
    const record = this.update(runId, { status });
    this.append(runId, { type: "run_status_changed", status, ...(text ? { text } : {}) });
    return record;
  }

  private recordPath(runId: string): string {
    return join(this.runDir(runId), "run.json");
  }

  private eventsPath(runId: string): string {
    return join(this.runDir(runId), "events.jsonl");
  }

  private runDir(runId: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(runId)) throw new Error(`Invalid run id: ${runId}`);
    return join(this.root, runId);
  }

  private lockPath(runId: string): string {
    return join(this.runDir(runId), ".write.lock");
  }

  private writeRecord(record: RunRecord): void {
    atomicWrite(this.recordPath(record.runId), `${JSON.stringify(redactValue(record), null, 2)}\n`);
  }

  private ensureRoot(): void {
    mkdirSync(this.root, { recursive: true, mode: 0o700 });
    const ignorePath = join(dirname(this.root), ".gitignore");
    if (!existsSync(ignorePath)) atomicWrite(ignorePath, "*\n!.gitignore\n");
  }
}
