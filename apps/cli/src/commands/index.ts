import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Effect, Option } from "effect";
import * as Daemon from "#src/clipboard/daemon.ts";
import { ensureDaemonRunning } from "#src/clipboard/ensure-daemon.ts";
import { childCmd } from "#src/commands/child.ts";
import { clipboardCmd } from "#src/commands/clipboard.ts";
import { createCmd } from "#src/commands/create.ts";
import { dnsCmd } from "#src/commands/dns-doctor.ts";
import { lsCmd } from "#src/commands/ls.ts";
import { removeCmd } from "#src/commands/remove.ts";
import { HostConfig, HostSharedConfig, mountedVolumeDir } from "#src/config.ts";
import { resolveContainer } from "#src/resolve-container.ts";

const rootCmd = CliCommand.make("neo", {}, () =>
	Effect.gen(function* () {
		const cwd = process.cwd();
		const match = resolveContainer(cwd, yield* HostConfig.dir);

		const containerName = Option.match(match, {
			onNone: () => "one",
			onSome: (m) => m.containerName,
		});

		yield* ensureDaemonRunning;
		const { port } = yield* Daemon.Config.load;
		yield* Daemon.SharedPort.write(port).pipe(
			Effect.provide(HostSharedConfig(containerName)),
		);

		yield* Command.make("container", "start", containerName).pipe(
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);

		const execCommand = Option.match(match, {
			onNone: () =>
				Command.make(
					"container",
					"exec",
					"-it",
					"-u",
					"neo",
					containerName,
					"zsh",
				),
			onSome: (m) => {
				const cdPath = `${mountedVolumeDir}/${m.subpath}`;
				return Command.make(
					"container",
					"exec",
					"-it",
					"-u",
					"neo",
					m.containerName,
					"zsh",
					"-c",
					`cd '${cdPath}' && exec zsh`,
				);
			},
		});

		return yield* execCommand.pipe(
			Command.stdin("inherit"),
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);
	}),
);

export const neoCmd = rootCmd.pipe(
	CliCommand.withSubcommands([
		lsCmd,
		createCmd,
		removeCmd,
		dnsCmd,
		clipboardCmd,
		childCmd,
	]),
);
