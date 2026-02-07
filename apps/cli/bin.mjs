#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const entry = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"entries/cli.ts",
);

try {
	execFileSync("bun", [entry, ...args], { stdio: "inherit" });
} catch (e) {
	process.exit(e.status ?? 1);
}
process.exit(0);
