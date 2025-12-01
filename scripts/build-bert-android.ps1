# BERT Model Android Build Script for Windows
# Run this to build APK with BERT model support

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "BERT Android Build Pre-Check" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1] Model files check..." -ForegroundColor Yellow
if (Test-Path "assets\models\cyberbully_model.tflite") {
    $size = (Get-Item "assets\models\cyberbully_model.tflite").Length / 1MB
    Write-Host "  ✓ cyberbully_model.tflite: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  ✗ cyberbully_model.tflite NOT FOUND!" -ForegroundColor Red
    exit 1
}

if (Test-Path "assets\models\vocab.txt") {
    Write-Host "  ✓ vocab.txt exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ vocab.txt NOT FOUND!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠ IMPORTANT: BERT will NOT work in Expo Go!" -ForegroundColor Yellow
Write-Host "  You MUST build an APK to test BERT functionality" -ForegroundColor Yellow

Write-Host ""
Write-Host "[2] Build Options:" -ForegroundColor Cyan
Write-Host "  1) Clean + Debug Build (Recommended for first time)"
Write-Host "  2) Debug Build Only (Faster)"
Write-Host "  3) Release Build"
Write-Host "  4) Cancel"

$choice = Read-Host "`nEnter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n[Step 1/2] Cleaning previous build..." -ForegroundColor Yellow
        Set-Location android
        if ($IsWindows -or $env:OS -match "Windows") {
            .\gradlew.bat clean
        } else {
            ./gradlew clean
        }
        Set-Location ..
        
        Write-Host "`n[Step 2/2] Building debug APK with BERT support..." -ForegroundColor Yellow
        npx expo run:android --variant debug
    }
    "2" {
        Write-Host "`nBuilding debug APK with BERT support..." -ForegroundColor Yellow
        npx expo run:android --variant debug
    }
    "3" {
        Write-Host "`nBuilding release APK with BERT support..." -ForegroundColor Yellow
        npx expo run:android --variant release
    }
    "4" {
        Write-Host "`nCancelled" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "`nInvalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "To monitor BERT loading in the APK:" -ForegroundColor Yellow
Write-Host '  adb logcat | Select-String "BERT"' -ForegroundColor White
Write-Host ""
Write-Host "Expected success messages:" -ForegroundColor Yellow
Write-Host "  ✓ [BERT Detector] TFLite module is available" -ForegroundColor Green
Write-Host "  ✓ [BERT Detector] Vocabulary loaded successfully" -ForegroundColor Green
Write-Host "  ✓ [BERT Detector] Model loaded successfully in XXms" -ForegroundColor Green
Write-Host "  ✓ [BERT Detector] ✓ Initialized successfully" -ForegroundColor Green
Write-Host ""
Write-Host "In the app, BERT should show without '(Unavailable)'" -ForegroundColor Yellow
