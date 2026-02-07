import { Command as CliCommand } from "@effect/cli";
import { Console, Effect } from "effect";
import * as ClipboardClient from "#src/clipboard/client.ts";
import { writeClipboardShims } from "#src/clipboard/shims.ts";
import { ChildSharedConfig } from "#src/config.ts";

const ChildLayers = ChildSharedConfig;

const setupCmd = CliCommand.make("setup", {}, () =>
	Effect.gen(function* () {
		const binDir = yield* writeClipboardShims;
		yield* Console.log(`export PATH="${binDir}:$PATH"`);
	}).pipe(Effect.provide(ChildLayers)),
).pipe(CliCommand.withDescription("Set up container environment"));

const clipboardGetCmd = CliCommand.make("get", {}, () =>
	ClipboardClient.getClipboard.pipe(Effect.provide(ChildLayers)),
).pipe(CliCommand.withDescription("Get clipboard content from host"));

const clipboardPushCmd = CliCommand.make("push", {}, () =>
	ClipboardClient.pushClipboard.pipe(Effect.provide(ChildLayers)),
).pipe(CliCommand.withDescription("Push clipboard content to host"));

const clipboardCmd = CliCommand.make("clipboard", {}, () => Effect.void).pipe(
	CliCommand.withDescription("Clipboard operations"),
	CliCommand.withSubcommands([clipboardGetCmd, clipboardPushCmd]),
);

export const childCmd = CliCommand.make("child", {}, () => Effect.void).pipe(
	CliCommand.withDescription("Container child utilities"),
	CliCommand.withSubcommands([setupCmd, clipboardCmd]),
);
