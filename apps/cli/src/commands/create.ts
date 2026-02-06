import { Args, Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Effect, Option } from "effect";
import { getConfigDir } from "#src/config.ts";
import { generateSlug } from "#src/random-slug.ts";

const nameArg = Args.text({ name: "name" }).pipe(Args.optional);

export const createCmd = CliCommand.make("create", { name: nameArg }, (args) =>
	Effect.gen(function* () {
		const name = Option.getOrElse(args.name, () => generateSlug());
		const configDir = yield* getConfigDir;
		const sharedDir = `${configDir}/containers/${name}/shared`;

		yield* Command.make("mkdir", "-p", sharedDir).pipe(
			Command.exitCode,
		);

		return yield* Command.make(
			"container",
			"run",
			"--name",
			name,
			"--cpus",
			"8",
			"--memory",
			"8g",
			"--volume",
			`${sharedDir}:/shared/`,
			"-it",
			"docker.io/library/debian:stable-slim",
			"bash",
		).pipe(
			Command.stdin("inherit"),
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);
	}),
).pipe(CliCommand.withDescription("Create a new container"));
