import { Command } from "@effect/platform";
import { Effect, Option, Schedule, Scope } from "effect";
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

	if (Option.isSome(existing)) return existing.value;

	const daemonScope = yield* Scope.make();
	yield* Command.make("neo", "clipboard", "daemon").pipe(
		Command.start,
		Scope.extend(daemonScope),
	);

	return yield* waitForConfig;
});
