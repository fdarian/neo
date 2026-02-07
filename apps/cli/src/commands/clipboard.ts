import { Command as CliCommand } from "@effect/cli";
import { HttpServer } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect } from "effect";
import getPort from "get-port";
import * as Daemon from "#src/clipboard/daemon.ts";
import { HostLayers } from "#src/host.ts";

const daemonCmd = CliCommand.make("daemon", {}, () =>
	Effect.gen(function* () {
		const port = yield* Effect.tryPromise(() => getPort());
		yield* HttpServer.serveEffect(Daemon.server).pipe(
			Effect.provide(
				BunHttpServer.layer({ port: port, hostname: "0.0.0.0" }).pipe(
					HttpServer.withLogAddress,
				),
			),
		);

		yield* Daemon.Config.write({ pid: process.pid, port });

		yield* Effect.never;
	}).pipe(Effect.provide(HostLayers), Effect.scoped),
).pipe(CliCommand.withDescription("Run clipboard bridge daemon"));

export const clipboardCmd = CliCommand.make(
	"clipboard",
	{},
	() => Effect.void,
).pipe(
	CliCommand.withDescription("Clipboard utilities"),
	CliCommand.withSubcommands([daemonCmd]),
);
