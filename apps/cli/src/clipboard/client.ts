import { FileSystem, HttpBody, HttpClient } from "@effect/platform";
import { Effect } from "effect";
import * as Daemon from "#src/clipboard/daemon.ts";

const resolveHostGateway = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const content = yield* fs.readFileString("/etc/resolv.conf");
	const lines = content.split("\n");

	for (const line of lines) {
		if (line.startsWith("nameserver")) {
			const parts = line.split(/\s+/);
			if (parts.length >= 2) {
				return parts[1];
			}
		}
	}

	return yield* Effect.fail(
		new Error("No nameserver found in /etc/resolv.conf"),
	);
});

export const getClipboard = Effect.gen(function* () {
	const info = yield* Daemon.SharedDaemonInfo.read;
	const host = yield* resolveHostGateway;

	const response = yield* HttpClient.get(`http://${host}:${info.port}/clipboard`, {
		headers: { Authorization: `Bearer ${info.token}` },
	});

	const text = yield* response.text;

	process.stdout.write(text);
});

export const pushClipboard = Effect.gen(function* () {
	const info = yield* Daemon.SharedDaemonInfo.read;
	const host = yield* resolveHostGateway;

	const body = yield* Effect.promise(() => Bun.stdin.text());

	yield* HttpClient.post(`http://${host}:${info.port}/clipboard`, {
		body: HttpBody.text(body),
		headers: { Authorization: `Bearer ${info.token}` },
	});
});
