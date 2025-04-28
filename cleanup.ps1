# Salad App Cleanup Script
# This script removes unnecessary files to free up disk space

Write-Host "Starting cleanup of unnecessary files in the Salad App project..." -ForegroundColor Green

# Define base path
$basePath = "d:\shark\salad-app"

# Remove build artifacts
$buildDirs = @(
    "$basePath\frontend\dist",
    "$basePath\frontend\build",
    "$basePath\frontend\.next",
    "$basePath\pocketbase-mcp\build"
)

foreach ($dir in $buildDirs) {
    if (Test-Path $dir) {
        Write-Host "Removing build directory: $dir" -ForegroundColor Yellow
        Remove-Item -Path $dir -Recurse -Force
    }
}

# Remove cache directories
$cacheDirs = @(
    "$basePath\frontend\.cache",
    "$basePath\frontend\.parcel-cache",
    "$basePath\.cache",
    "$basePath\frontend\node_modules\.cache",
    "$basePath\pocketbase-mcp\node_modules\.cache"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "Removing cache directory: $dir" -ForegroundColor Yellow
        Remove-Item -Path $dir -Recurse -Force
    }
}

# Remove log files
$logFiles = @(
    "$basePath\npm-debug.log",
    "$basePath\yarn-error.log",
    "$basePath\frontend\npm-debug.log",
    "$basePath\frontend\yarn-error.log",
    "$basePath\pocketbase-mcp\npm-debug.log",
    "$basePath\pocketbase-mcp\yarn-error.log"
)

foreach ($file in $logFiles) {
    if (Test-Path $file) {
        Write-Host "Removing log file: $file" -ForegroundColor Yellow
        Remove-Item -Path $file -Force
    }
}

# Remove any temp directories or files
$tempFiles = @(
    "$basePath\.tmp",
    "$basePath\frontend\.tmp",
    "$basePath\pocketbase-mcp\.tmp",
    "$basePath\frontend\tempCodeRunnerFile.js",
    "$basePath\tempCodeRunnerFile.c"
)

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Write-Host "Removing temp file/directory: $file" -ForegroundColor Yellow
        if ((Get-Item $file) -is [System.IO.DirectoryInfo]) {
            Remove-Item -Path $file -Recurse -Force
        } else {
            Remove-Item -Path $file -Force
        }
    }
}

# Clean backend/pb_data directory of old backups (keep latest 3)
$backupsDir = "$basePath\backend\pb\pb_data\backups"
if (Test-Path $backupsDir) {
    Write-Host "Cleaning old backups in $backupsDir..." -ForegroundColor Yellow
    $backups = Get-ChildItem -Path $backupsDir | Sort-Object LastWriteTime -Descending
    if ($backups.Count -gt 3) {
        $backupsToRemove = $backups | Select-Object -Skip 3
        foreach ($backup in $backupsToRemove) {
            Remove-Item -Path $backup.FullName -Force
            Write-Host "  Removed old backup: $($backup.Name)" -ForegroundColor Gray
        }
    }
}

Write-Host "Cleanup completed successfully!" -ForegroundColor Green

# Options for node_modules cleanup
Write-Host "`n======= SPACE SAVING OPTIONS =======" -ForegroundColor Cyan
Write-Host "To clean up node_modules (will require reinstall):" -ForegroundColor Cyan
Write-Host "Option 1: Remove frontend node_modules only:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Path '$basePath\frontend\node_modules' -Recurse -Force" -ForegroundColor Gray
Write-Host "Option 2: Remove pocketbase-mcp node_modules only:" -ForegroundColor Cyan
Write-Host "  Remove-Item -Path '$basePath\pocketbase-mcp\node_modules' -Recurse -Force" -ForegroundColor Gray
Write-Host "Option 3: Remove all node_modules (most space savings):" -ForegroundColor Cyan
Write-Host "  Remove-Item -Path '$basePath\frontend\node_modules' -Recurse -Force" -ForegroundColor Gray
Write-Host "  Remove-Item -Path '$basePath\pocketbase-mcp\node_modules' -Recurse -Force" -ForegroundColor Gray
Write-Host "`nYou can reinstall dependencies by running 'npm install' in each directory" -ForegroundColor Cyan