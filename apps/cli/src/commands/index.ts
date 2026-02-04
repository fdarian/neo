import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Effect, Option } from "effect";
import { getConfigDir, mountedVolumeDir } from "#src/config.ts";
import { resolveContainer } from "#src/resolve-container.ts";

export const neoCmd = CliCommand.make("neo", {}, () =>
	Effect.gen(function* () {
		const cwd = process.cwd();
		const configDir = yield* getConfigDir;
		const match = resolveContainer(cwd, configDir);

		const command = Option.match(match, {
			onNone: () =>
				Command.make("container", "exec", "-it", "-u", "neo", "one", "zsh"),
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

		return yield* command.pipe(
			Command.stdin("inherit"),
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);
	}),
);
