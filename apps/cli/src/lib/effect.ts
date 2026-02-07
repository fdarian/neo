import type { Command } from "@effect/platform";

// Minimal quoting helper (POSIX-ish; adjust for Windows / your needs)
const shQuote = (s: string) =>
	/^[A-Za-z0-9_./-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`;

export function renderCommand(cmd: Command.Command): string {
	// Turn it into a plain JSON-ish object using the representation
	const j = JSON.parse(JSON.stringify(cmd)) as any;

	// Inspect the shape once in your project and adapt these field names:
	// common shapes are like { command: "ls", args: ["-al"] } or similar.
	const bin: string = j.command ?? j.name ?? j.process ?? "<unknown>";
	const args: string[] = j.args ?? j.arguments ?? [];

	return [bin, ...args].map(shQuote).join(" ");
}
