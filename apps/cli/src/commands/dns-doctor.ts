import { Command as CliCommand } from "@effect/cli";
import { Command } from "@effect/platform";
import { Console, Effect } from "effect";

const doctorCmd = CliCommand.make("doctor", {}, () =>
	Effect.gen(function* () {
		let changed = false;

		yield* Console.log("[dns] Checking DNS resolver...");
		const dnsLsOutput = yield* Command.make(
			"container",
			"system",
			"dns",
			"ls",
		).pipe(Command.string);

		if (!dnsLsOutput.includes("neo")) {
			const neoExitCode = yield* Command.make(
				"container",
				"system",
				"dns",
				"create",
				"neo",
			).pipe(
				Command.stdout("inherit"),
				Command.stderr("inherit"),
				Command.exitCode,
			);
			if (neoExitCode === 0) {
				yield* Console.log("[dns] Created DNS resolver 'neo'.");
				changed = true;
			} else {
				yield* Console.log(
					"[dns] Failed to create DNS resolver 'neo'. Try running with sudo.",
				);
			}
		} else {
			yield* Console.log("[dns] DNS resolver 'neo' already exists.");
		}

		yield* Console.log("[dns] Checking dns.domain property...");
		const domainOutput = yield* Command.make(
			"container",
			"system",
			"property",
			"get",
			"dns.domain",
		).pipe(Command.string);

		if (domainOutput.trim() !== "neo") {
			const domainExitCode = yield* Command.make(
				"container",
				"system",
				"property",
				"set",
				"dns.domain",
				"neo",
			).pipe(
				Command.stdout("inherit"),
				Command.stderr("inherit"),
				Command.exitCode,
			);
			if (domainExitCode === 0) {
				yield* Console.log("[dns] Set dns.domain to 'neo'.");
				changed = true;
			} else {
				yield* Console.log(
					"[dns] Failed to set dns.domain. Try running with sudo.",
				);
			}
		} else {
			yield* Console.log("[dns] dns.domain is already set to 'neo'.");
		}

		yield* Console.log("[dns] Checking container DNS records...");
		const containerListOutput = yield* Command.make(
			"container",
			"list",
			"--format",
			"json",
		).pipe(Command.string);
		const containers =
			containerListOutput.trim() === "" ? [] : JSON.parse(containerListOutput);

		const runningContainers = containers.filter(
			(container: any) => container.status === "running",
		);

		const missingDns: Array<string> = [];
		yield* Effect.forEach(runningContainers, (container: any) =>
			Command.make(
				"dig",
				"@127.0.0.1",
				"-p",
				"2053",
				`${container.configuration.id}.neo`,
				"+short",
			).pipe(
				Command.string,
				Effect.flatMap((digOutput) => {
					if (digOutput.trim() === "") {
						missingDns.push(container.configuration.id);
						return Console.log(
							`[dns] ! Container '${container.configuration.id}' is running but has no DNS record. Recreate it for DNS to work.`,
						);
					}
					return Console.log(
						`[dns] Container '${container.configuraiton.id}' → ${digOutput.trim()}`,
					);
				}),
			),
		);

		if (changed) {
			yield* Console.log("");
			yield* Console.log(
				"DNS configuration changed. Restart your containers for changes to take effect:",
			);
			yield* Console.log("  container system stop && container system start");
		} else if (missingDns.length > 0) {
			yield* Console.log("");
			yield* Console.log(
				"DNS records are missing for some containers. Recreate them for DNS to work.",
			);
		} else {
			yield* Console.log("");
			yield* Console.log("DNS configuration is correct.");
		}
	}),
).pipe(CliCommand.withDescription("Check and fix DNS configuration"));

export const dnsCmd = CliCommand.make("dns", {}, () => Effect.void).pipe(
	CliCommand.withDescription("DNS utilities"),
	CliCommand.withSubcommands([doctorCmd]),
);
