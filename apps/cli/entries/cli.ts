import pkg from "../package.json" with { type: "json" };
import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { neoCmd } from "#src/commands/index.ts";

export const cli = Command.run(neoCmd, {
	name: "neo",
	version: pkg.version,
});

cli(process.argv).pipe(
	Effect.provide(BunContext.layer),
	BunRuntime.runMain,
);
