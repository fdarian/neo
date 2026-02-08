import { Command } from "@effect/platform";
import { Effect, Option, Schedule, Scope } from "effect";
import { ClientRegistry } from "./client-registry.ts";
import * as Daemon from "./daemon.ts";

const waitForConfig = Daemon.Config.load.pipe(
	Effect.retry(Schedule.spaced("100 millis").pipe(Schedule.compose(Schedule.recurs(50)))),
);

export const ensureDaemonRunning = Effect.gen(function* () {
	const existing = yield* Daemon.Config.load.pipe(
		Effect.flatMap((info) =>
			Effect.try(() => {
				process.kill(info.pid, 0);
				return info;
			}),
		),
		Effect.option,
	);

	const config = Option.isSome(existing)
		? existing.value
		: yield* Effect.gen(function* () {
				const daemonScope = yield* Scope.make();
				yield* Command.make("neo", "clipboard", "daemon").pipe(
					Command.start,
					Scope.extend(daemonScope),
				);
				return yield* waitForConfig;
			});

	yield* ClientRegistry.register(process.pid);
	yield* Effect.addFinalizer(() =>
		Effect.gen(function* () {
			const remaining = yield* ClientRegistry.deregister(process.pid);
			if (remaining === 0) {
				yield* Effect.try(() => process.kill(config.pid));
			}
		}).pipe(Effect.ignore),
	);

	return config;
});
