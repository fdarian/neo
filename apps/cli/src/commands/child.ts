import { Command as CliCommand } from "@effect/cli";
import { Console, Effect } from "effect";
import * as Daemon from "#src/clipboard/daemon.ts";
import { writeClipboardShims } from "#src/clipboard/shims.ts";
import { ChildSharedConfig } from "#src/config.ts";

const ChildLayers = ChildSharedConfig;

const setupCmd = CliCommand.make("setup", {}, () =>
	Effect.gen(function* () {
		const binDir = yield* writeClipboardShims;
		yield* Console.log(`export PATH="${binDir}:$PATH"`);
	}).pipe(Effect.provide(ChildLayers)),
).pipe(CliCommand.withDescription("Set up container environment"));

const clipboardDaemonPort = CliCommand.make("clipboardDaemonPort", {}, () =>
	Effect.gen(function* () {
		const port = yield* Daemon.SharedPort.read.pipe(
			Effect.provide(ChildSharedConfig),
		);
		yield* Console.log(port);
	}),
).pipe(CliCommand.withDescription("Set up container environment"));

export const childCmd = CliCommand.make("child", {}, () => Effect.void).pipe(
	CliCommand.withDescription("Container child utilities"),
	CliCommand.withSubcommands([setupCmd, clipboardDaemonPort]),
);
