#!/bin/bash
# 后台自动同步入口（供 macOS 开机自启使用，见 com.oblivion.content-watch.plist）
cd "$(dirname "$0")/.."
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
exec node scripts/publish-d1.mjs watch
