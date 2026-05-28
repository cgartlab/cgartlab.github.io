# Syncthing 跨设备同步部署指南

## 架构概览

```
          ┌──────────────────┐
          │   GitHub 远端     │  ← Git push/pull 管理版本
          └────────┬─────────┘
                   │ git push / git pull
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
 ┌──────┐    ┌──────────┐    ┌──────────┐
 │ Mac  │    │ Windows  │    │   NAS    │  ← 各设备有独立的 Git 仓库
 │(开发)│    │  (开发)   │    │(文件服务) │
 └──┬───┘    └────┬─────┘    └────┬─────┘
    │             │               │
    └─────────────┼───────────────┘
                  │
            Syncthing (通过 NAS 中转)
           同步内容文件（.md, .astro, .ts 等）
           不同步：.git/ node_modules/ 构建产物 缓存
```

### 核心原则

| 工具 | 管什么 | 不管什么 |
|------|--------|----------|
| **Git** | 版本历史、代码部署、分支管理 | 不负责跨设备文件分发 |
| **Syncthing** | 工作目录文件跨设备同步 | 不同步 Git 数据库、依赖、构建产物 |
| **GitHub** | 代码中央存储、CI/CD 部署 | 不参与日常文件同步 |

### 换行符策略

| 仓库 | 策略 | 原因 |
|------|------|------|
| **cgartlab.github.io** | `* text=auto eol=lf` | 代码项目统一 LF，全平台兼容 |
| **cgartlab-obsidian** | `* -text` (保持原样) | Obsidian 原生支持 CRLF+LF |

---

## 已完成（Mac 上已配置）

以下文件已在 Mac 上创建，Syncthing 会自动同步到 NAS 和 Windows：

| 文件 | 位置 | 说明 |
|------|------|------|
| `.stignore-common` | 每个仓库根目录 | 共享忽略规则，自动同步到所有设备 |
| `.gitattributes` | `cgartlab.github.io/` | 换行符策略（LF 统一） |
| `scripts/syncthing-cleanup.sh` | `cgartlab.github.io/scripts/` | macOS/Linux 清理脚本 |
| `scripts/syncthing-cleanup.ps1` | `cgartlab.github.io/scripts/` | Windows 清理脚本 |

---

## 各设备部署步骤

### ⚙️ Step 1: 在所有设备上创建 `.stignore`

每个设备需要创建一个 `.stignore` 文件（因为 Syncthing 设计上不同步此文件），内容只有一行：

**cgartlab.github.io/.stignore：**
```
#include .stignore-common
```

**cgartlab-obsidian/.stignore：**
```
#include .stignore-common
```

#### Windows 操作：
```powershell
# 写入 blog 仓库
"#include .stignore-common" | Out-File -Encoding utf8 "D:\github-repos\cgartlab.github.io\.stignore"

# 写入 obsidian 仓库
"#include .stignore-common" | Out-File -Encoding utf8 "D:\github-repos\cgartlab-obsidian\.stignore"
```

#### NAS (Linux) 操作：
```bash
echo "#include .stignore-common" > /volume1/github-repos/cgartlab.github.io/.stignore
echo "#include .stignore-common" > /volume1/github-repos/cgartlab-obsidian/.stignore
```

> **验证**：创建后打开 Syncthing Web UI，确认文件夹状态正常，没有报错。

---

### ⚙️ Step 2: 在 Windows 上配置 Git

博客仓库需要设置 LF 换行符策略（与 `.gitattributes` 配合）：

```powershell
cd D:\github-repos\cgartlab.github.io
git config core.autocrlf false
git config core.eol lf

cd D:\github-repos\cgartlab-obsidian
git config core.autocrlf false
```

---

### ⚙️ Step 3: 运行清理脚本

各设备独立运行清理脚本，移除已同步的无用数据。

#### macOS / Linux / NAS：
```bash
# 先确认脚本已同步过来
ls -la scripts/syncthing-cleanup.sh

chmod +x scripts/syncthing-cleanup.sh
./scripts/syncthing-cleanup.sh
```

#### Windows：
```powershell
cd D:\github-repos\cgartlab.github.io
.\scripts\syncthing-cleanup.ps1
```

---

### ⚙️ Step 4: 可选 — 手动清理旧数据

清理脚本不会动 `.git/` 目录。各设备可选择手动删除：

#### Windows：
```powershell
# 确认所有 Git 修改已推送后，可删除 .git/ 重新 clone
# 但这不是必须的 —— .stignore 已阻止继续同步
# 各设备的 .git/ 会独立存在，互不干扰

# 安全删除构建产物
Remove-Item -Recurse -Force "D:\github-repos\cgartlab.github.io\node_modules"
Remove-Item -Recurse -Force "D:\github-repos\cgartlab.github.io\.astro"
Remove-Item -Recurse -Force "D:\github-repos\cgartlab.github.io\dist"
Remove-Item -Recurse -Force "D:\github-repos\cgartlab.github.io\.wrangler"
Remove-Item -Recurse -Force "D:\github-repos\cgartlab.github.io\.cache"
Remove-Item -Recurse -Force "D:\github-repos\cgartlab.github.io\.copilot-index"
```

#### NAS (Linux)：
```bash
rm -rf /volume1/github-repos/cgartlab.github.io/node_modules
rm -rf /volume1/github-repos/cgartlab.github.io/.astro
rm -rf /volume1/github-repos/cgartlab.github.io/dist
rm -rf /volume1/github-repos/cgartlab.github.io/.wrangler
rm -rf /volume1/github-repos/cgartlab.github.io/.cache
rm -rf /volume1/github-repos/cgartlab.github.io/.copilot-index
```

---

### 📱 移动设备（Android / 未来 iOS）

移动设备不需要 Git，只需通过 Syncthing 同步文件内容：

1. 在 Android 上安装 Syncthing
2. 将 `cgartlab-obsidian` 文件夹添加到 Syncthing（通过 NAS 发现）
3. 配置完成后，Obsidian 可以直接打开该 vault
4. **不需要**在移动设备上创建 `.stignore`（但如果有条件创建，效果更佳）

---

## 工作流规范

### ✅ 推荐工作流

```
1. [某设备] 编辑文件 → 保存
2. Syncthing 自动同步到其他设备
3. [桌面设备] 完成写作/开发后：
   └─ git add → git commit → git push
4. [其他桌面设备] 开始工作前：
   └─ git pull（从 GitHub）
   └─ 等待 Syncthing 同步完成
```

### ❌ 避免的操作

| 禁止 | 原因 |
|------|------|
| 在两台设备上同时编辑同一文件 | 产生 SyncConflict 文件 |
| 在 Syncthing 同步中时执行 `git pull` | 文件状态不一致 |
| 直接复制 `.git/` 目录跨设备 | 现有 .stignore 已阻止 |
| 在非桌面设备上执行 Git 操作 | 手机/平板无 Git 环境 |

### 🔄 遇到 SyncConflict 时的处理

当 Syncthing 检测到冲突时，会生成 `.sync-conflict-*.xxx` 文件：

```bash
# 查找所有冲突文件
find . -name "*.sync-conflict-*" 2>/dev/null

# 手动比较差异，合并后删除冲突文件
rm "path/to/file.sync-conflict-20260527-xxxxxx.xxx"
```

---

## 验证清单

配置完成后，逐项确认：

- [ ] `cgartlab.github.io/.stignore` 存在（所有桌面设备）
- [ ] `cgartlab-obsidian/.stignore` 存在（所有桌面设备）
- [ ] `.stignore-common` 内容在所有设备上一致（通过 Syncthing 自动同步）
- [ ] Windows 上 Git 配置 `core.autocrlf false`
- [ ] 清理脚本运行成功
- [ ] Syncthing Web UI 显示所有状态正常（无红色错误）
- [ ] 在每台设备上 `git status` 正常

---

## 故障排除

### Q: `.git/` 目录在其他设备上还存在吗？
A: 存在，但不再通过 Syncthing 同步。它们变成了各设备**独立的 Git 仓库**。这是预期的行为——每台设备通过 GitHub push/pull 交换 Git 数据，而不是通过 Syncthing。

### Q: 一台设备 `git pull` 后，其他设备的文件会立刻更新吗？
A: Git pull 会更新工作目录的文件，然后 Syncthing 会将这些变更同步给其他设备。同步有短暂延迟（通常几秒到几十秒）。

### Q: 某设备没有 `.stignore` 会怎样？
A: 该设备会继续尝试同步 `.git/` 和其他被忽略的目录。**建议尽快在所有桌面设备上创建 `.stignore`。**

### Q: 为什么不用 `?d` 自动删除其他设备的 `.git/`？
A: `?d` 标记会删除**所有设备**（包括 Mac）上的 `.git/`，造成 Git 仓库损坏。因此 `.stignore-common` 中只使用普通忽略规则，不自动删除。
