import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Effect, Option } from "effect";
import { getConfigDir, mountedVolumeDir } from "#src/config.ts";
import { resolveContainer } from "#src/resolve-container.ts";
import { dnsCmd } from "#src/commands/dns-doctor.ts";

const rootCmd = CliCommand.make("neo", {}, () =>
	Effect.gen(function* () {
		const cwd = process.cwd();
		const configDir = yield* getConfigDir;
		const match = resolveContainer(cwd, configDir);

		const containerName = Option.match(match, {
			onNone: () => "one",
			onSome: (m) => m.containerName,
		});

		yield* Command.make("container", "start", containerName).pipe(
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);

		const execCommand = Option.match(match, {
			onNone: () =>
				Command.make("container", "exec", "-it", "-u", "neo", containerName, "zsh"),
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
	CliCommand.withSubcommands([dnsCmd]),
);
