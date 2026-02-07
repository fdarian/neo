import { Config, Effect } from "effect";

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
