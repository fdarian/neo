import {
	Command,
	FileSystem,
	HttpRouter,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform";
import { Effect, Schema } from "effect";
import { HostConfig, HostSharedConfig, SharedConfig } from "#src/config.ts";

export namespace Config {
	export const DaemonConfig = Schema.Struct({
		pid: Schema.Number,
		port: Schema.Number,
		token: Schema.String,
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

	export const remove = Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		yield* fs.remove(yield* getPath);
	}).pipe(Effect.ignore);
}

export namespace SharedDaemonInfo {
	const getPath = Effect.gen(function* () {
		return `${(yield* SharedConfig).dir}/daemon-info`;
	});

	export const read = Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* getPath;
		yield* Effect.logDebug(`Reading ${path}`);
		const content = yield* fs.readFileString(path);
		return JSON.parse(content) as { port: number; token: string };
	});

	export const write = (info: { port: number; token: string }) =>
		Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const dir = (yield* SharedConfig).dir;
			yield* fs.makeDirectory(dir, { recursive: true });
			const path = `${dir}/daemon-info`;
			yield* fs.writeFileString(path, JSON.stringify(info));
			yield* Effect.logDebug(`Wrote port ${info.port} and token to ${path}`);
		});

	export const writeForContainer = (
		info: { port: number; token: string },
		containerName: string,
	) => write(info).pipe(Effect.provide(HostSharedConfig(containerName)));

	export const writeAllRunning = (info: { port: number; token: string }) =>
		Effect.gen(function* () {
			const output = yield* Command.make("container", "ls").pipe(
				Command.string,
			);
			const names = output
				.trim()
				.split("\n")
				.slice(1)
				.filter((line) => line.includes("running"))
				.map((line) => line.split(/\s+/)[0]);
			yield* Effect.forEach(names, (name) => writeForContainer(info, name));
		});

	export const removeAll = Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const containersDir = `${yield* HostConfig.dir}/containers`;
		const entries = yield* fs.readDirectory(containersDir);
		yield* Effect.forEach(entries, (name) =>
			fs.remove(`${containersDir}/${name}/shared/.neo/daemon-info`).pipe(Effect.ignore)
		);
	}).pipe(Effect.ignore);
}

export const makeRouter = (token: string) => {
	let clipboardContent = "";

	const getClipboard = Effect.gen(function* () {
		yield* Effect.logDebug(`Forwarding <>${clipboardContent}</>`);
		return HttpServerResponse.text(clipboardContent);
	});

	const postClipboard = Effect.gen(function* () {
		const request = yield* HttpServerRequest.HttpServerRequest;
		const body = yield* request.text;
		clipboardContent = body;
		yield* Command.make("pbcopy").pipe(Command.feed(body), Command.exitCode);
		yield* Effect.logDebug(`Received <>${body}</>`);
		return HttpServerResponse.text("ok");
	});

	return HttpRouter.empty.pipe(
		HttpRouter.get("/clipboard", getClipboard),
		HttpRouter.post("/clipboard", postClipboard),
		HttpRouter.use((httpApp) =>
			Effect.gen(function* () {
				const request = yield* HttpServerRequest.HttpServerRequest;
				if (request.headers.authorization !== `Bearer ${token}`) {
					return HttpServerResponse.text("Unauthorized", { status: 401 });
				}
				return yield* httpApp;
			}),
		),
	);
};
