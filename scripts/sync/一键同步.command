#!/bin/bash
# 一键同步：把 Obsidian 文章发布到 Cloudflare D1
# 双击即可运行；发布失败时会停在窗口里显示原因。

cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "⟳ 开始同步文章到博客..."
node scripts/publish-d1.mjs sync
RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
  echo "✅ 同步完成，可以关闭此窗口。"
else
  echo "❌ 同步失败，请检查上面的错误信息。"
fi
echo ""
echo "按任意键关闭…"
read -r -n 1
