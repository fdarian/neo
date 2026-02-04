import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";

export const neoCmd = CliCommand.make("neo", {}, () =>
	Command.make("container", "exec", "-it", "-u", "neo", "one", "zsh").pipe(
		Command.stdin("inherit"),
		Command.stdout("inherit"),
		Command.stderr("inherit"),
		Command.exitCode,
	),
);
