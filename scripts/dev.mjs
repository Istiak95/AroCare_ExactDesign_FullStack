import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

function start(name, cwd) {
  const child = spawn(npmCommand, ["run", "dev"], {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      console.error(`${name} stopped with exit code ${code}.`);
      stopAll(code);
    } else if (signal) {
      console.log(`${name} stopped (${signal}).`);
    }
  });

  children.push(child);
}

let stopping = false;
function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(exitCode), 250);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

start("backend", new URL("../backend/", import.meta.url));
start("frontend", new URL("../frontend/", import.meta.url));
