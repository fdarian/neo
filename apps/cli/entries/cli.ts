import { Command } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { neoCmd } from "#src/commands/index.ts";

export const cli = Command.run(neoCmd, {
	name: "neo",
	version: "0.0.0",
});

cli(process.argv).pipe(
	Effect.provide(BunContext.layer),
	BunRuntime.runMain,
);
