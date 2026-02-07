import {
	Command,
	FileSystem,
	HttpMiddleware,
	HttpRouter,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform";
import { Effect, Schema } from "effect";
import { HostConfig, SharedConfig } from "#src/config.ts";

export namespace Config {
	export const DaemonConfig = Schema.Struct({
		pid: Schema.Number,
		port: Schema.Number,
	});
	const ConfigFromJson = Schema.parseJson(DaemonConfig);
	export type DaemonConfig = typeof DaemonConfig.Type;

	const getPath = Effect.gen(function* () {
		return `${yield* HostConfig.dir}/daemon.json`;
	});

	export const write = (input: DaemonConfig) =>
		Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			yield* fs.makeDirectory(yield* HostConfig.dir, { recursive: true });
			yield* fs.writeFileString(yield* getPath, JSON.stringify(input));
		});

	export const load = Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* getPath;
		const content = yield* fs.readFileString(path);
		return yield* Schema.decode(ConfigFromJson)(content);
	});
}

export namespace SharedPort {
	const getPath = Effect.gen(function* () {
		return `${(yield* SharedConfig).dir}/daemon-port`;
	});

	export const read = Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* getPath;
		yield* Effect.logDebug(`Reading ${path}`);
		const content = yield* fs.readFileString(path);
		return Number(content);
	});

	export const write = (port: number) =>
		Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const path = yield* getPath;
			yield* fs.writeFileString(path, String(port));
			yield* Effect.logDebug(`Wrote ${port} to ${path}`);
		});
}

const getClipboard = Effect.gen(function* () {
	const content = yield* Command.make("pbpaste").pipe(Command.string);
	yield* Effect.logDebug(`Forwarding ${content}`);
	return HttpServerResponse.text(content);
});

const postClipboard = Effect.gen(function* () {
	const request = yield* HttpServerRequest.HttpServerRequest;
	const body = yield* request.text;
	yield* Command.make("pbcopy").pipe(Command.feed(body), Command.exitCode);
	yield* Effect.logDebug(`Received ${body}`);
	return HttpServerResponse.text("ok");
});

export const server = HttpRouter.empty.pipe(
	HttpRouter.get("/clipboard", getClipboard),
	HttpRouter.post("/clipboard", postClipboard),
);
// .pipe(HttpRouter.use(HttpMiddleware.logger));
