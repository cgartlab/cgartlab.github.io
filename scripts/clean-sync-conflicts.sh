#!/usr/bin/env bash
# ============================================================
# clean-sync-conflicts.sh — 自动清理 Syncthing 冲突文件
#
# 安全策略：
#   - 只在已知安全的目录下删除冲突文件
#   - 内容文件（.md/.canvas/.png 等）的冲突文件不会自动删除
#   - 所有操作记录到系统日志
#
# 安全目录（这些目录下的冲突文件可安全删除）：
#   .obsidian/plugins/  ← 插件配置（不同设备独立，冲突无影响）
#   node_modules/       ← 依赖（独立安装，不同步）
#   dist/ .astro/ .wrangler/ 等构建目录
# ============================================================
set -euo pipefail

# --- 配置 ---
REPOS_BASE="/vol1/1000/02-Area/github-repos"
LOG_TAG="clean-sync-conflicts"
DRY_RUN="${DRY_RUN:-false}"

# 安全路径模式（在这些路径下的冲突文件自动删除）
SAFE_PATTERNS=(
  ".obsidian/plugins/"
  "node_modules/"
  "dist/"
  ".astro/"
  ".wrangler/"
  ".output/"
  ".vercel/"
  ".netlify/"
  ".cache/"
  ".temp/"
  ".copilot-index/"
)

# --- 日志 ---
log_info()  { logger -t "$LOG_TAG" "[INFO] $1"; echo "[INFO] $1"; }
log_warn()  { logger -t "$LOG_TAG" "[WARN] $1"; echo "[WARN] $1"; }
log_error() { logger -t "$LOG_TAG" "[ERROR] $1"; echo "[ERROR] $1"; }

# --- 检查路径是否在安全目录下 ---
is_safe_path() {
  local filepath="$1"
  for pattern in "${SAFE_PATTERNS[@]}"; do
    if echo "$filepath" | grep -q "$pattern"; then
      return 0  # 是安全的
    fi
  done
  return 1  # 不是安全的
}

# --- 主逻辑 ---
deleted_count=0
skipped_count=0

while IFS= read -r -d '' conflict_file; do
  if [ -z "$conflict_file" ]; then
    continue
  fi

  # 检查是否在安全路径下
  if is_safe_path "$conflict_file"; then
    size=$(du -h "$conflict_file" 2>/dev/null | cut -f1)
    if [ "$DRY_RUN" = "true" ]; then
      log_info "[DRY-RUN] 将删除: $conflict_file ($size)"
    else
      rm -f "$conflict_file"
      log_info "已删除: $conflict_file ($size)"
    fi
    deleted_count=$((deleted_count + 1))
  else
    log_info "跳过（内容文件）: $conflict_file"
    skipped_count=$((skipped_count + 1))
  fi
done < <(find "$REPOS_BASE" -name "*.sync-conflict-*" -type f -print0 2>/dev/null)

log_info "执行完毕: 删除 $deleted_count 个, 跳过 $skipped_count 个（内容文件）"
