#!/bin/sh

set -eu

PACKAGE_PATH="native/macos-agent"
RELEASE_BINARY="$PACKAGE_PATH/.build/release/harmoni-agent"
TAURI_DEBUG_BINARY="src-tauri/target/debug/harmoni-agent"
TAURI_DEBUG_TEMPORARY="$TAURI_DEBUG_BINARY.next"
TARGET_TRIPLE="$(rustc -vV | sed -n 's/^host: //p')"

case "$TARGET_TRIPLE" in
    aarch64-apple-darwin|x86_64-apple-darwin) ;;
    *)
        echo "Unsupported native sidecar target: $TARGET_TRIPLE" >&2
        exit 1
        ;;
esac

swift build --configuration release --package-path "$PACKAGE_PATH"
cp "$RELEASE_BINARY" "$RELEASE_BINARY-$TARGET_TRIPLE"
mkdir -p "$(dirname "$TAURI_DEBUG_BINARY")"
trap 'rm -f "$TAURI_DEBUG_TEMPORARY"' EXIT
cp "$RELEASE_BINARY" "$TAURI_DEBUG_TEMPORARY"
mv -f "$TAURI_DEBUG_TEMPORARY" "$TAURI_DEBUG_BINARY"
trap - EXIT
