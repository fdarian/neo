import { Effect } from "effect";

export const getConfigDir = Effect.sync(() => {
	const home = process.env.HOME;
	if (!home) {
		throw new Error("HOME environment variable is not set");
	}
	return `${home}/.config/neo`;
});

export const mountedVolumeDir = "/shared";
