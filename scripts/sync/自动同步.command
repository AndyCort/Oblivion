#!/bin/bash
# 自动同步：监听 Obsidian，保存文章即自动发布
# 双击运行后保持此窗口开着；关闭窗口即停止。

cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

node scripts/publish-d1.mjs watch
