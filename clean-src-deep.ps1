# Deep Clean and Reorganize /src directory script
Write-Host "Starting deep cleanup and reorganization of /src directory..." -ForegroundColor Green

# Define paths
$srcPath = "d:\shark\salad-app\frontend\src"
$backupDir = "d:\shark\salad-app\frontend\src_full_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Create full backup first
Write-Host "Creating complete backup in $backupDir" -ForegroundColor Cyan
Copy-Item -Path $srcPath -Destination $backupDir -Recurse -Force

# Define the structure we want to keep (minimal set)
$keepStructure = @{
    "core" = @("pb.ts", "main.tsx", "vite-env.d.ts")  # Core files
    "components" = @()  # Essential UI components
    "hooks" = @("useAuth.tsx")  # Essential hooks
    "pages" = @()  # Main application pages
    "styles" = @("global.css")  # Style files
    "utils" = @()  # Utility functions
}

# Create temp directory for reorganization
$tempDir = "d:\shark\salad-app\frontend\src_temp"
New-Item -Path $tempDir -ItemType Directory -Force | Out-Null

# Create the new directory structure in temp
foreach ($dir in $keepStructure.Keys) {
    New-Item -Path "$tempDir\$dir" -ItemType Directory -Force | Out-Null
}

# Copy files to their new locations
Write-Host "`nReorganizing files to new structure..." -ForegroundColor Green

# Move core files
foreach ($file in $keepStructure["core"]) {
    $sourcePath = Join-Path -Path $srcPath -ChildPath $file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "$tempDir\" -Force
        Write-Host "Copied core file: $file" -ForegroundColor Yellow
    }
}

# Copy App.tsx to root
$appPath = Join-Path -Path $srcPath -ChildPath "App.tsx"
if (Test-Path $appPath) {
    Copy-Item -Path $appPath -Destination "$tempDir\" -Force
    Write-Host "Copied App.tsx to root" -ForegroundColor Yellow
}

# Move hooks
foreach ($file in $keepStructure["hooks"]) {
    $sourcePath = Join-Path -Path $srcPath -ChildPath "hooks\$file"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "$tempDir\hooks\" -Force
        Write-Host "Copied hook: hooks\$file" -ForegroundColor Yellow
    } else {
        # Try to find the file elsewhere if not in hooks directory
        $foundFiles = Get-ChildItem -Path $srcPath -Filter $file -Recurse
        if ($foundFiles) {
            foreach ($foundFile in $foundFiles) {
                Copy-Item -Path $foundFile.FullName -Destination "$tempDir\hooks\" -Force
                Write-Host "Found and copied hook from alternate location: $($foundFile.FullName)" -ForegroundColor Yellow
            }
        }
    }
}

# Move global.css to styles
$cssPath = Join-Path -Path $srcPath -ChildPath "global.css"
if (Test-Path $cssPath) {
    Copy-Item -Path $cssPath -Destination "$tempDir\styles\" -Force
    Write-Host "Moved global.css to styles directory" -ForegroundColor Yellow
}

# Find and move important components (we'll look for key components)
$componentPatterns = @("*Nav*.tsx", "*Button*.tsx", "*Card*.tsx", "*Layout*.tsx")
foreach ($pattern in $componentPatterns) {
    $components = Get-ChildItem -Path $srcPath -Filter $pattern -Recurse
    foreach ($component in $components) {
        Copy-Item -Path $component.FullName -Destination "$tempDir\components\" -Force
        Write-Host "Found important component: $($component.Name)" -ForegroundColor Yellow
    }
}

# Find and move important pages
$pagePatterns = @("*Home*.tsx", "*Login*.tsx", "*Register*.tsx", "*Dashboard*.tsx", "*Profile*.tsx", "*About*.tsx")
foreach ($pattern in $pagePatterns) {
    $pages = Get-ChildItem -Path $srcPath -Filter $pattern -Recurse
    foreach ($page in $pages) {
        Copy-Item -Path $page.FullName -Destination "$tempDir\pages\" -Force
        Write-Host "Found important page: $($page.Name)" -ForegroundColor Yellow
    }
}

# Find utility functions
$utilPatterns = @("*util*.ts", "*helper*.ts", "*format*.ts")
foreach ($pattern in $utilPatterns) {
    $utils = Get-ChildItem -Path $srcPath -Filter $pattern -Recurse
    foreach ($util in $utils) {
        Copy-Item -Path $util.FullName -Destination "$tempDir\utils\" -Force
        Write-Host "Found utility: $($util.Name)" -ForegroundColor Yellow
    }
}

# Now replace the src directory with our temp directory
Write-Host "`nReplacing src directory with clean version..." -ForegroundColor Green

# Check if we have essential files before replacing
$essentialFilesMoved = $false
$mainTsx = Join-Path -Path $tempDir -ChildPath "main.tsx"
$appTsx = Join-Path -Path $tempDir -ChildPath "App.tsx"
if ((Test-Path $mainTsx) -and (Test-Path $appTsx)) {
    $essentialFilesMoved = $true
}

if ($essentialFilesMoved) {
    # Rename current src directory to old
    $oldSrcDir = "d:\shark\salad-app\frontend\src_old_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Rename-Item -Path $srcPath -NewName $oldSrcDir
    
    # Move temp directory to be the new src
    Rename-Item -Path $tempDir -NewName $srcPath
    
    Write-Host "Successfully replaced src directory with clean version!" -ForegroundColor Green
    Write-Host "Old src directory is available at: $oldSrcDir" -ForegroundColor Cyan
    Write-Host "Full backup is available at: $backupDir" -ForegroundColor Cyan
} else {
    Write-Host "Error: Essential files were not found in the temp directory. Aborting replacement." -ForegroundColor Red
    Write-Host "The reorganized files are available in: $tempDir" -ForegroundColor Yellow
    Write-Host "Please manually review and copy over what you need." -ForegroundColor Yellow
}

Write-Host "`nDeep cleanup completed!" -ForegroundColor Green