import { Command } from "@effect/cli";
import { FetchHttpClient } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { neoCmd } from "#src/commands/index.ts";
import pkg from "../package.json" with { type: "json" };

export const cli = Command.run(neoCmd, {
	name: "neo",
	version: pkg.version,
});

cli(process.argv).pipe(
	Effect.provide(Layer.mergeAll(BunContext.layer, FetchHttpClient.layer)),
	BunRuntime.runMain,
);
