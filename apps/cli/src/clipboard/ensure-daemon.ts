import { Command } from "@effect/platform";
import { Effect, Option, Scope } from "effect";
import * as Daemon from "./daemon.ts";

export const ensureDaemonRunning = Effect.gen(function* () {
	const existing = yield* Daemon.Config.load.pipe(
		Effect.flatMap((info) =>
			Effect.try(() => {
				process.kill(info.pid, 0);
				return info.port;
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
});
