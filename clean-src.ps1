# Clean /src directory script
Write-Host "Starting cleanup of /src directory..." -ForegroundColor Green

# Define src path
$srcPath = "d:\shark\salad-app\frontend\src"

# Define essential files and directories that should NOT be deleted
$essentialFiles = @(
    "App.tsx",
    "main.tsx",
    "pb.ts",
    "vite-env.d.ts",
    "global.css"
)

# Create temp directory for backups
$tempBackupDir = "d:\shark\salad-app\frontend\src_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in $tempBackupDir" -ForegroundColor Cyan
New-Item -Path $tempBackupDir -ItemType Directory -Force | Out-Null

# First, back up essential files
foreach ($file in $essentialFiles) {
    $filePath = Join-Path -Path $srcPath -ChildPath $file
    if (Test-Path $filePath) {
        $destPath = Join-Path -Path $tempBackupDir -ChildPath $file
        Copy-Item -Path $filePath -Destination $destPath -Force
        Write-Host "Backed up essential file: $file" -ForegroundColor Yellow
    }
}

# Back up essential directories
$essentialDirs = @(
    "hooks",
    "components",
    "pages",
    "contexts"
)

foreach ($dir in $essentialDirs) {
    $dirPath = Join-Path -Path $srcPath -ChildPath $dir
    if (Test-Path $dirPath) {
        $destPath = Join-Path -Path $tempBackupDir -ChildPath $dir
        Copy-Item -Path $dirPath -Destination $destPath -Recurse -Force
        Write-Host "Backed up essential directory: $dir" -ForegroundColor Yellow
    }
}

# Now clean unnecessary files from src directory (preserving the backed up files)
Write-Host "`nCleaning /src directory..." -ForegroundColor Green

# Remove all compiler caches and build artifacts
Get-ChildItem -Path $srcPath -Filter "*.js.map" -Recurse | ForEach-Object {
    Remove-Item -Path $_.FullName -Force
    Write-Host "Removed map file: $($_.Name)" -ForegroundColor Gray
}

Get-ChildItem -Path $srcPath -Filter "*.d.ts" -Recurse -Exclude "vite-env.d.ts" | ForEach-Object {
    Remove-Item -Path $_.FullName -Force
    Write-Host "Removed declaration file: $($_.Name)" -ForegroundColor Gray
}

# Remove temporary files and logs
Get-ChildItem -Path $srcPath -Include "*.log", "*.tmp", "*~", "*.bak" -Recurse -File | ForEach-Object {
    Remove-Item -Path $_.FullName -Force
    Write-Host "Removed temporary file: $($_.Name)" -ForegroundColor Gray
}

# Clean empty directories
$emptyCleaned = $true
while ($emptyCleaned) {
    $emptyCleaned = $false
    Get-ChildItem -Path $srcPath -Directory -Recurse | ForEach-Object {
        if ((Get-ChildItem -Path $_.FullName -Recurse -File) -eq $null) {
            Write-Host "Removing empty directory: $($_.FullName)" -ForegroundColor Gray
            Remove-Item -Path $_.FullName -Force -Recurse
            $emptyCleaned = $true
        }
    }
}

Write-Host "`nCleanup of /src directory completed!" -ForegroundColor Green
Write-Host "A backup of essential files has been created at: $tempBackupDir" -ForegroundColor Cyan
Write-Host "`nIf you need to restore any files, copy them from the backup directory." -ForegroundColor Cyan