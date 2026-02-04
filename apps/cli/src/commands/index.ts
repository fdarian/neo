import { Command } from "@effect/cli";
import { Effect } from "effect";

export const neoCmd = Command.make("neo", {}, () =>
	Effect.sync(() => {
		const result = Bun.spawnSync(
			["container", "exec", "-it", "-u", "neo", "one", "zsh"],
			{
				stdio: ["inherit", "inherit", "inherit"],
			},
		);
		if (result.exitCode !== 0) {
			throw new Error(
				`Command failed with exit code ${result.exitCode}`,
			);
		}
	}),
);
