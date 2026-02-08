import { Command as CliCommand } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import * as Daemon from "#src/clipboard/daemon.ts";
import { ClientRegistry } from "#src/clipboard/client-registry.ts";
import { HostLayers } from "#src/host.ts";

const statusCmd = CliCommand.make("status", {}, () =>
	Effect.gen(function* () {
		const config = yield* Daemon.Config.load.pipe(Effect.option);

		if (Option.isNone(config)) {
			yield* Console.log("Daemon\n  Status:  not configured");
			return;
		}

		const alive = Effect.try(() => {
			process.kill(config.value.pid, 0);
			return true;
		}).pipe(Effect.orElseSucceed(() => false));

		const isAlive = yield* alive;

		yield* Console.log("Daemon");
		if (isAlive) {
			yield* Console.log(`  Status:  running`);
			yield* Console.log(`  PID:     ${config.value.pid}`);
			yield* Console.log(`  Port:    ${config.value.port}`);
		} else {
			yield* Console.log(`  Status:  stale (pid ${config.value.pid} not found)`);
			yield* Console.log(`  Port:    ${config.value.port}`);
		}

		const clients = yield* ClientRegistry.readAll;
		const statuses = clients.map((pid) => {
			try {
				process.kill(pid, 0);
				return { pid, status: "active" as const };
			} catch {
				return { pid, status: "stale" as const };
			}
		});

		const activeCount = statuses.filter((s) => s.status === "active").length;
		const staleCount = statuses.filter((s) => s.status === "stale").length;

		const parts: Array<string> = [];
		if (activeCount > 0) parts.push(`${activeCount} active`);
		if (staleCount > 0) parts.push(`${staleCount} stale`);

		if (parts.length > 0) {
			yield* Console.log(`\nSessions (${parts.join(", ")})`);
		} else {
			yield* Console.log(`\nSessions (none)`);
		}

		for (const entry of statuses) {
			yield* Console.log(`  PID ${entry.pid}  ${entry.status}`);
		}
	}).pipe(Effect.provide(HostLayers)),
);

export const daemonCmd = CliCommand.make("daemon").pipe(
	CliCommand.withDescription("Daemon management"),
	CliCommand.withSubcommands([statusCmd]),
);
