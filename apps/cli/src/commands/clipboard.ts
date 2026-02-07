import { Command as CliCommand } from "@effect/cli";
import { HttpMiddleware, HttpServer } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer, Option } from "effect";
import getPort from "get-port";
import * as readline from "readline";
import * as Daemon from "#src/clipboard/daemon.ts";
import { HostLayers } from "#src/host.ts";

const confirm = (message: string) =>
	Effect.promise<boolean>(
		() =>
			new Promise((resolve) => {
				const rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout,
				});
				rl.question(message, (answer) => {
					rl.close();
					resolve(answer.toLowerCase() === "y");
				});
			}),
	);

const daemonCmd = CliCommand.make("daemon", {}, () =>
	Effect.gen(function* () {
		const existing = yield* Daemon.Config.load.pipe(
			Effect.flatMap((info) =>
				Effect.try(() => {
					process.kill(info.pid, 0);
					return info;
				}),
			),
			Effect.option,
		);

		if (Option.isSome(existing)) {
			const yes = yield* confirm(
				`Daemon already running (pid: ${existing.value.pid}). Kill and restart? (y/n) `,
			);
			if (!yes) return;
			process.kill(existing.value.pid);
		}

		const port = yield* Effect.tryPromise(() => getPort());
		const token = crypto.randomUUID();
		yield* Daemon.Config.write({ pid: process.pid, port, token });
		yield* Daemon.SharedDaemonInfo.writeAllRunning({ port, token });
		yield* Effect.addFinalizer(() => Effect.logInfo("Shutting down server"));
		const server = HttpServer.serve(Daemon.makeRouter(token), HttpMiddleware.logger).pipe(
			HttpServer.withLogAddress,
		);
		yield* Layer.launch(
			server.pipe(
				Layer.provide(BunHttpServer.layer({ port: port, hostname: "0.0.0.0" })),
			),
		);
	}).pipe(Effect.provide(HostLayers), Effect.scoped),
).pipe(CliCommand.withDescription("Run clipboard bridge daemon"));

export const clipboardCmd = CliCommand.make("clipboard").pipe(
	CliCommand.withDescription("Clipboard utilities"),
	CliCommand.withSubcommands([daemonCmd]),
);
