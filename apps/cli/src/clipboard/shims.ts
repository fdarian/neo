import { FileSystem } from "@effect/platform";
import { Effect } from "effect";
import { childNeoDir } from "#src/config.ts";

const shimBinDir = `${childNeoDir}/bin`;

const xclipScript = `#!/bin/sh
PORT=$(neo child clipboardDaemonPort)
DAEMON_HOST=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)
URL="http://$DAEMON_HOST:$PORT/clipboard"
OUTPUT=false
for arg in "$@"; do
  case "$arg" in
    -o) OUTPUT=true ;;
  esac
done
if [ "$OUTPUT" = "true" ]; then
  exec curl -sf "$URL"
else
  exec curl -sf -X POST --data-binary @- "$URL"
fi
`;

const xselScript = `#!/bin/sh
PORT=$(neo child clipboardDaemonPort)
DAEMON_HOST=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)
URL="http://$DAEMON_HOST:$PORT/clipboard"
OUTPUT=false
for arg in "$@"; do
  case "$arg" in
    -o|--output) OUTPUT=true ;;
  esac
done
if [ "$OUTPUT" = "true" ]; then
  exec curl -sf "$URL"
else
  exec curl -sf -X POST --data-binary @- "$URL"
fi
`;

export const writeClipboardShims = Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;
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
