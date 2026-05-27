<#
.SYNOPSIS
    Syncthing 垃圾数据清理脚本 (Windows)
.DESCRIPTION
    在创建/更新 .stignore 和 .stignore-common 后运行，
    触发 Syncthing 重新扫描以应用新的忽略规则。
    清理依赖、构建产物、缓存等可安全重新生成的数据。
.NOTES
    不会删除 .git/ 目录，仅阻止其继续同步。
#>

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Info  { Write-Host "[INFO]" -ForegroundColor Blue -NoNewline; Write-Host " $args" }
function Write-Ok    { Write-Host "[OK]" -ForegroundColor Green -NoNewline; Write-Host " $args" }
function Write-Warn  { Write-Host "[WARN]" -ForegroundColor Yellow -NoNewline; Write-Host " $args" }
function Write-Fail  { Write-Host "[FAIL]" -ForegroundColor Red -NoNewline; Write-Host " $args" }

# --- 查找 Syncthing 配置 ---
$configPaths = @(
    "$env:LOCALAPPDATA\Syncthing\config.xml",
    "$env:APPDATA\Syncthing\config.xml"
)

$configPath = $null
foreach ($path in $configPaths) {
    if (Test-Path $path) {
        $configPath = $path
        break
    }
}

if (-not $configPath) {
    Write-Fail "找不到 Syncthing 配置文件。请确认 Syncthing 已安装并运行。"
    exit 1
}

Write-Info "Syncthing 配置文件: $configPath"

# --- 读取 XML ---
[xml]$config = Get-Content $configPath

# --- 提取 API Key ---
$apiKey = $config.configuration.gui.apikey
if (-not $apiKey) {
    Write-Fail "无法获取 Syncthing API Key。"
    exit 1
}

# --- 遍历所有同步文件夹 ---
$folders = $config.configuration.folder
Write-Info "发现 $($folders.Count) 个同步文件夹"

foreach ($folder in $folders) {
    $folderId = $folder.id
    $folderPath = $folder.path
    $folderName = Split-Path $folderPath -Leaf

    Write-Host ""
    Write-Info "处理: $folderName ($folderId)"
    Write-Info "路径: $folderPath"

    # 检查 .stignore
    $stignorePath = Join-Path $folderPath ".stignore"
    if (Test-Path $stignorePath) {
        Write-Ok ".stignore 已存在"
    } else {
        Write-Warn ".stignore 不存在，请先在仓库根目录创建"
    }

    # 检查 .stignore-common
    $commonPath = Join-Path $folderPath ".stignore-common"
    if (Test-Path $commonPath) {
        Write-Ok ".stignore-common 已存在"
    } else {
        Write-Warn ".stignore-common 不存在，请先同步获取"
    }

    # 触发 Syncthing 重新扫描
    Write-Info "正在触发重新扫描..."
    $url = "http://127.0.0.1:8384/rest/db/scan?folder=$folderId"
    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers @{
            "X-Api-Key" = $apiKey
        } -UseBasicParsing -TimeoutSec 10
        Write-Ok "重新扫描已触发 ($($response.StatusCode))"
    } catch {
        Write-Warn "API 请求失败: $_"
    }
}

# --- 可安全删除的目录列表 ---
Write-Host ""
Write-Host "============================================"
Write-Info "操作完成！"
Write-Host ""
Write-Host "可安全删除的构建产物和设备缓存（在各设备上独立运行）："
$repoBase = "D:\github-repos"
if (-not (Test-Path $repoBase)) {
    $repoBase = Read-Host "请输入 github-repos 路径 (默认 D:\github-repos)"
    if (-not $repoBase) { $repoBase = "D:\github-repos" }
}

$patterns = @(
    @{Repo = "cgartlab.github.io"; Dirs = @("node_modules", ".astro", ".wrangler", "dist", ".output", ".cache", ".temp", ".copilot-index")},
    @{Repo = "cgartlab-obsidian";  Dirs = @(".copilot-index")}
)

$totalSize = 0
foreach ($item in $patterns) {
    $repoPath = Join-Path $repoBase $item.Repo
    foreach ($dir in $item.Dirs) {
        $target = Join-Path $repoPath $dir
        if (Test-Path $target) {
            $size = (Get-ChildItem $target -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            if ($size -gt 1GB) {
                $sizeStr = "{0:N1} GB" -f ($size / 1GB)
            } else {
                $sizeStr = "{0:N0} MB" -f ($size / 1MB)
            }
            Write-Host "  Remove-Item -Recurse -Force '$target'  ($sizeStr)"
        }
    }
}
Write-Host ""
Write-Host "注意：.git/ 目录不会自动删除。各设备确认 Git 已推送后，可手动删除。"
Write-Host "============================================"

# --- 打开 Syncthing Web UI ---
Write-Host ""
$openUI = Read-Host "是否打开 Syncthing Web UI 检查状态？(Y/n)"
if ($openUI -ne "n") {
    Start-Process "http://127.0.0.1:8384"
}
