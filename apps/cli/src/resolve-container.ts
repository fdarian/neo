import { Option } from "effect";

export const resolveContainer = (
	cwd: string,
	configDir: string,
): Option.Option<{ containerName: string; subpath: string }> => {
	const prefix = `${configDir}/containers/`;
	if (!cwd.startsWith(prefix)) {
		return Option.none();
	}

	const rest = cwd.slice(prefix.length);
	const segments = rest.split("/");

	if (segments.length < 2 || segments[1] !== "shared") {
		return Option.none();
	}

	const containerName = segments[0];
	const subpath = segments.slice(2).join("/");

	return Option.some({ containerName, subpath });
};
