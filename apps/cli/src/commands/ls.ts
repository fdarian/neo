import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Effect } from "effect";

export const lsCmd = CliCommand.make("ls", {}, () =>
	Effect.gen(function* () {
		return yield* Command.make("container", "ls").pipe(
			Command.stdout("inherit"),
			Command.stderr("inherit"),
			Command.exitCode,
		);
	}),
).pipe(CliCommand.withDescription("List all containers"));
