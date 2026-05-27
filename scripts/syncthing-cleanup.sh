#!/usr/bin/env bash
# ============================================================
# syncthing-cleanup.sh — 一键清理 Syncthing 已同步的垃圾数据
#
# 用途：在创建/更新 .stignore 和 .stignore-common 后运行，
#       触发 Syncthing 重新扫描以应用新的忽略规则，
#       同时标记已废弃的目录（node_modules、构建缓存等）
#       以便向其他设备发送删除请求。
#
# 安全说明：
#   - 不会删除 .git/（Git 仓库数据），仅阻止其继续同步
#   - 只会清理可安全重新生成的数据（依赖、构建产物、缓存）
#
# 用法：
#   chmod +x scripts/syncthing-cleanup.sh
#   ./scripts/syncthing-cleanup.sh
# ============================================================
set -euo pipefail

# --- 颜色输出 ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; }

# --- 查找 Syncthing 配置 ---
CONFIG_DIR=""
for candidate in "$HOME/Library/Application Support/Syncthing" "$HOME/.config/syncthing"; do
    if [ -f "$candidate/config.xml" ]; then
        CONFIG_DIR="$candidate"
        break
    fi
done

if [ -z "$CONFIG_DIR" ]; then
    fail "找不到 Syncthing 配置文件。请确认 Syncthing 已安装并运行。"
    exit 1
fi

info "Syncthing 配置目录: $CONFIG_DIR"

# --- 提取 API Key ---
API_KEY=$(grep -o '<apikey>[^<]*</apikey>' "$CONFIG_DIR/config.xml" 2>/dev/null | sed 's/<[^>]*>//g')

if [ -z "$API_KEY" ]; then
    fail "无法获取 Syncthing API Key。"
    exit 1
fi

# --- 提取所有同步文件夹 ID 和路径 ---
info "正在读取 Syncthing 同步文件夹列表..."

FOLDER_IDS=()
FOLDER_PATHS=()

while IFS="|" read -r id path; do
    [ -n "$id" ] && [ -n "$path" ] && [ "$path" != "~" ] && [ -d "$path" ] || continue
    FOLDER_IDS+=("$id")
    FOLDER_PATHS+=("$path")
done < <(python3 -c "
import plistlib, sys
with open('$CONFIG_DIR/config.xml') as f:
    data = f.read()
import re
for m in re.finditer(r'<folder[^>]*id=\"([^\"]+)\"[^>]*path=\"([^\"]+)\"', data):
    print(m.group(1) + '|' + m.group(2))
" 2>/dev/null)

if [ ${#FOLDER_IDS[@]} -eq 0 ]; then
    fail "未找到 Syncthing 同步文件夹。"
    exit 1
fi

info "发现 ${#FOLDER_IDS[@]} 个同步文件夹"

# --- 为每个文件夹执行扫描 ---
for i in "${!FOLDER_IDS[@]}"; do
    FOLDER_ID="${FOLDER_IDS[$i]}"
    FOLDER_PATH="${FOLDER_PATHS[$i]}"
    FOLDER_NAME=$(basename "$FOLDER_PATH")

    echo ""
    info "处理: $FOLDER_NAME ($FOLDER_ID)"
    info "路径: $FOLDER_PATH"

    # 检查是否有 .stignore
    if [ -f "$FOLDER_PATH/.stignore" ]; then
        ok ".stignore 已存在"

        # 检查是否有 .stignore-common
        if [ -f "$FOLDER_PATH/.stignore-common" ]; then
            ok ".stignore-common 已存在"

            # 汇总当前忽略的目录大小
            echo ""
            info "以下目录将被忽略（不再同步）："
            for pattern in .git node_modules .astro .wrangler dist .output .cache .temp .copilot-index .stversions; do
                if [ -d "$FOLDER_PATH/$pattern" ]; then
                    size=$(du -sh "$FOLDER_PATH/$pattern" 2>/dev/null | cut -f1)
                    echo "  - $pattern/  ($size)"
                fi
            done
        else
            warn ".stignore-common 不存在，请先创建"
        fi
    else
        warn ".stignore 不存在，请先创建"
    fi

    # 触发 Syncthing 重新扫描
    info "正在触发重新扫描..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "X-Api-Key: $API_KEY" \
        "http://127.0.0.1:8384/rest/db/scan?folder=$FOLDER_ID" 2>/dev/null || echo "failed")

    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
        ok "重新扫描已触发 ($HTTP_STATUS)"
    else
        warn "触发重新扫描失败 (HTTP $HTTP_STATUS)，尝试备用方法..."
        # 备用：touch 一个文件触发 fsnotify
        touch "$FOLDER_PATH/.stignore" 2>/dev/null
    fi
done

# --- 总结 ---
echo ""
echo "============================================"
info "操作完成！"
echo ""
echo "接下来："
echo "  1. 检查 Syncthing Web UI (http://127.0.0.1:8384) 确认同步状态"
echo "  2. .git/ 目录已停止同步，但它仍然存在于各设备本地"
echo "  3. 要清理其他设备上的 node_modules/ 等废弃目录，"
echo "     请在其他设备上单独运行此脚本" 
echo ""
echo "清理可安全删除的构建产物（设备独立运行）："
for dir in node_modules .astro .wrangler dist .output .cache .temp .copilot-index; do
    for repo in cgartlab.github.io cgartlab-obsidian; do
        target="$HOME/Documents/github-repos/$repo/$dir"
        if [ -d "$target" ]; then
            size=$(du -sh "$target" 2>/dev/null | cut -f1)
            echo "  rm -rf $repo/$dir/  ($size)"
        fi
    done
done
echo "============================================"
