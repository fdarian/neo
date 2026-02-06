import { Args, Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Effect, Option } from "effect";
import { getConfigDir } from "#src/config.ts";
import { resolveContainer } from "#src/resolve-container.ts";

const nameArg = Args.text({ name: "name" }).pipe(Args.optional);

export const removeCmd = CliCommand.make("remove", { name: nameArg }, (args) =>
	Effect.gen(function* () {
		const configDir = yield* getConfigDir;
		const nameFromArgs = args.name;
		const nameFromCwd = resolveContainer(process.cwd(), configDir).pipe(
			Option.map((m) => m.containerName),
		);

		const name = Option.orElse(nameFromArgs, () => nameFromCwd).pipe(
			Option.getOrThrowWith(() => new Error("No container name provided and not inside a container directory")),
		);

		yield* Command.make("container", "stop", name).pipe(
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
			Effect.catchAll(() => Effect.void),
		);

		return yield* Command.make("container", "rm", name).pipe(
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);
	}),
).pipe(CliCommand.withDescription("Remove a container"));
