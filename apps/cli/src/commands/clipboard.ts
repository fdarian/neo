import { Command as CliCommand } from "@effect/cli";
import { HttpMiddleware, HttpServer } from "@effect/platform";
import { BunContext, BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import getPort from "get-port";
import * as Daemon from "#src/clipboard/daemon.ts";
import { HostLayers } from "#src/host.ts";

const server = HttpServer.serve(Daemon.router, HttpMiddleware.logger).pipe(
	HttpServer.withLogAddress,
);

const daemonCmd = CliCommand.make("daemon", {}, () =>
	Effect.gen(function* () {
		const port = yield* Effect.tryPromise(() => getPort());
		yield* Daemon.Config.write({ pid: process.pid, port });
		yield* Effect.addFinalizer(() => Effect.logInfo("Shutting down server"));
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
