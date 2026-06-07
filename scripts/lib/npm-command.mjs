import { execFileSync } from "node:child_process";

function npmSpawnOptions(options = {}) {
  const spawnOptions = { ...options };
  if (process.platform === "win32") {
    spawnOptions.shell = true;
  }
  return spawnOptions;
}

export function resolveNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

export function resolveNpxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

export function resolveTarCommand() {
  return process.platform === "win32" ? "tar.exe" : "tar";
}

export function runNpm(args, options = {}) {
  return execFileSync(resolveNpmCommand(), args, npmSpawnOptions({
    stdio: "inherit",
    ...options
  }));
}

export function runNpmCapture(args, options = {}) {
  return execFileSync(resolveNpmCommand(), args, npmSpawnOptions({
    encoding: "utf8",
    stdio: "pipe",
    ...options
  }));
}

export function runNpx(args, options = {}) {
  return execFileSync(resolveNpxCommand(), args, npmSpawnOptions({
    stdio: "inherit",
    ...options
  }));
}

export function runNpxCapture(args, options = {}) {
  return execFileSync(resolveNpxCommand(), args, npmSpawnOptions({
    encoding: "utf8",
    stdio: "pipe",
    ...options
  }));
}
