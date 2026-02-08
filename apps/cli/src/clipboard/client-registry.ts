import { FileSystem } from "@effect/platform";
import { Effect, Schema } from "effect";
import { HostConfig } from "#src/config.ts";

const ClientsSchema = Schema.Array(Schema.Number);

const getPath = Effect.gen(function* () {
	return `${yield* HostConfig.dir}/daemon-clients.json`;
});

const readClients = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* getPath;
	const content = yield* fs.readFileString(path).pipe(
		Effect.catchAll(() => Effect.succeed("[]")),
	);
	return yield* Schema.decode(ClientsSchema)(JSON.parse(content));
});

const writeClients = (clients: Array<number>) =>
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* getPath;
		const tmpPath = `${path}.tmp`;

		yield* fs.makeDirectory(yield* HostConfig.dir, { recursive: true });
		yield* fs.writeFileString(tmpPath, JSON.stringify(clients));
		yield* fs.rename(tmpPath, path);
	});

export namespace ClientRegistry {
	export const readAll = readClients;

	export const register = (pid: number) =>
		Effect.gen(function* () {
			const clients = yield* readClients;
			yield* writeClients([...clients, pid]);
		});

	export const deregister = (pid: number) =>
		Effect.gen(function* () {
			const clients = yield* readClients;
			const remaining = clients.filter((p) => p !== pid);
			yield* writeClients(remaining);
			return remaining.length;
		});

	export const remove = Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		yield* fs.remove(yield* getPath);
	}).pipe(Effect.ignore);
}
