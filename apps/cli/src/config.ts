import { Config, Context, Effect, Layer } from "effect";

export class HostConfig extends Effect.Service<HostConfig>()(
	"config/HostConfig",
	{
		accessors: true,
		effect: Effect.gen(function* () {
			const home = yield* Config.string("HOME");
			const dir = `${home}/.config/neo`;

			return {
				dir,
				containerDir: (name: string) => {
					const baseDir = `${dir}/containers/${name}`;
					return {
						dir,
						sharedDir: `${baseDir}/shared`,
					};
				},
			};
		}),
	},
) {}

export const getConfigDir = HostConfig.dir;

export const mountedVolumeDir = "/shared";

export class SharedConfig extends Context.Tag("config/SharedConfig")<
	SharedConfig,
	{ dir: string }
>() {}

export const HostSharedConfig = (_containerName: string) =>
	Layer.effect(
		SharedConfig,
		Effect.gen(function* () {
			return { dir: (yield* HostConfig.containerDir("shared")).sharedDir };
		}),
	);

export const ChildSharedConfig = Layer.succeed(SharedConfig, {
	dir: `${mountedVolumeDir}/.neo`,
});
