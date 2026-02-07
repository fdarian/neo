import { FileSystem } from "@effect/platform";
import { Effect } from "effect";
import { SharedConfig } from "#src/config.ts";

const getShimBinDir = Effect.gen(function* () {
	const dir = (yield* SharedConfig).dir;
	return `${dir}/bin`;
});

const xclipScript = `#!/bin/sh
for arg in "$@"; do
  case "$arg" in
    -o) exec neo child clipboard get ;;
  esac
done
exec neo child clipboard push
`;

const xselScript = `#!/bin/sh
for arg in "$@"; do
  case "$arg" in
    -o|--output) exec neo child clipboard get ;;
  esac
done
exec neo child clipboard push
`;

export const writeClipboardShims = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
	const shimBinDir = yield* getShimBinDir;
	yield* fs.makeDirectory(shimBinDir, { recursive: true });
	yield* Effect.all(
		[
			Effect.gen(function* () {
				yield* fs.writeFileString(`${shimBinDir}/xclip`, xclipScript);
				yield* fs.chmod(`${shimBinDir}/xclip`, 0o755);
			}),
			Effect.gen(function* () {
				yield* fs.writeFileString(`${shimBinDir}/xsel`, xselScript);
				yield* fs.chmod(`${shimBinDir}/xsel`, 0o755);
			}),
		],
		{ concurrency: "unbounded" },
	);
	return shimBinDir;
});
