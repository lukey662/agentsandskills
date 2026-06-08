import { execFileSync } from "node:child_process";

export function openBrowser(url: string): void {
  const platform = process.platform;
  try {
    if (platform === "darwin") {
      execFileSync("open", [url], { stdio: "ignore" });
      return;
    }
    if (platform === "win32") {
      execFileSync("cmd", ["/c", "start", "", url], { stdio: "ignore" });
      return;
    }
    execFileSync("xdg-open", [url], { stdio: "ignore" });
  } catch {
    console.log(`Open this URL in your browser: ${url}`);
  }
}
