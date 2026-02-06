import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Console, Effect } from "effect";

const doctorCmd = CliCommand.make("doctor", {}, () =>
	Effect.gen(function* () {
		let changed = false;

		yield* Console.log("[dns] Checking DNS resolver...");
		const dnsLsOutput = yield* Command.make("container", "system", "dns", "ls").pipe(
			Command.string,
		);

		if (!dnsLsOutput.includes("neo")) {
			yield* Command.make("container", "system", "dns", "create", "neo").pipe(
				Command.stdout("inherit"),
				Command.stderr("inherit"),
				Command.exitCode,
			);
			yield* Console.log("[dns] Created DNS resolver 'neo'.");
			changed = true;
		} else {
			yield* Console.log("[dns] DNS resolver 'neo' already exists.");
		}

		yield* Console.log("[dns] Checking dns.domain property...");
		const domainOutput = yield* Command.make("container", "system", "property", "get", "dns.domain").pipe(
			Command.string,
		);

		if (domainOutput.trim() !== "neo") {
			yield* Command.make("container", "system", "property", "set", "dns.domain", "neo").pipe(
				Command.stdout("inherit"),
				Command.stderr("inherit"),
				Command.exitCode,
			);
			yield* Console.log("[dns] Set dns.domain to 'neo'.");
			changed = true;
		} else {
			yield* Console.log("[dns] dns.domain is already set to 'neo'.");
		}

		if (changed) {
			yield* Console.log("");
			yield* Console.log("DNS configuration changed. Restart your containers for changes to take effect:");
			yield* Console.log("  container system stop && container system start");
		} else {
			yield* Console.log("");
			yield* Console.log("DNS configuration is correct.");
		}
	}),
).pipe(CliCommand.withDescription("Check and fix DNS configuration"));

export const dnsCmd = CliCommand.make("dns", {}, () =>
	Effect.void,
).pipe(
	CliCommand.withDescription("DNS utilities"),
	CliCommand.withSubcommands([doctorCmd]),
);
