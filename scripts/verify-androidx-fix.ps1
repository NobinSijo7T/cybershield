# AndroidX Duplicate Classes - Diagnostic Script (PowerShell)
# This script helps verify that the fix has been applied correctly

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "AndroidX Fix Diagnostic Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if android folder exists
if (-Not (Test-Path "android")) {
    Write-Host "❌ Android folder not found!" -ForegroundColor Red
    Write-Host "   Run: npx expo prebuild --clean" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Android folder exists" -ForegroundColor Green
Write-Host ""

# Check if build.gradle has the fix
Write-Host "Checking android/app/build.gradle for configurations.all block..." -ForegroundColor Cyan

$buildGradlePath = "android\app\build.gradle"
if (Test-Path $buildGradlePath) {
    $content = Get-Content $buildGradlePath -Raw
    
    if ($content -match "configurations\.all") {
        Write-Host "✅ configurations.all block found!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Content:" -ForegroundColor Yellow
        
        # Extract and display the configurations.all block
        $lines = Get-Content $buildGradlePath
        $inBlock = $false
        $lineCount = 0
        
        foreach ($line in $lines) {
            if ($line -match "configurations\.all") {
                $inBlock = $true
            }
            if ($inBlock) {
                Write-Host $line
                $lineCount++
                if ($line -match "^\}") {
                    break
                }
            }
        }
    } else {
        Write-Host "❌ configurations.all block NOT found!" -ForegroundColor Red
        Write-Host "   The fix may not have been applied." -ForegroundColor Yellow
        Write-Host "   Run: npx expo prebuild --clean" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ build.gradle not found at $buildGradlePath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Checking for com.android.support dependencies..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Change to android directory
Push-Location android

# Generate dependency tree
Write-Host "Running Gradle dependency check (this may take a moment)..." -ForegroundColor Yellow
$dependenciesOutput = & .\gradlew.bat :app:dependencies --configuration releaseRuntimeClasspath 2>&1 | Out-String

# Search for support libraries
if ($dependenciesOutput -match "com\.android\.support") {
    Write-Host "⚠️  Found com.android.support dependencies:" -ForegroundColor Yellow
    Write-Host ""
    
    # Extract lines containing com.android.support
    $supportLines = $dependenciesOutput -split "`n" | Where-Object { $_ -match "com\.android\.support" } | Select-Object -First 20
    foreach ($line in $supportLines) {
        Write-Host $line
    }
    
    Write-Host ""
    Write-Host "These should be excluded by the configurations.all block." -ForegroundColor Yellow
} else {
    Write-Host "✅ No com.android.support dependencies found!" -ForegroundColor Green
    Write-Host "   The fix is working correctly." -ForegroundColor Green
}

# Return to original directory
Pop-Location

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If configurations.all is missing, run: npx expo prebuild --clean"
Write-Host "2. If com.android.support is still present, check the plugin is loaded"
Write-Host "3. Trigger EAS build: eas build --platform android"
Write-Host ""
