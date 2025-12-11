#!/usr/bin/env pwsh
# Prepare Android Assets for BERT Model
# This script copies model files to the Android assets directory for APK bundling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparing Android Assets for BERT Model" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetsSource = Join-Path $projectRoot "assets\models"
$assetsDestination = Join-Path $projectRoot "android\app\src\main\assets\models"

# Create destination directory if it doesn't exist
Write-Host "Creating assets directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $assetsDestination -Force | Out-Null
Write-Host "✓ Directory created: $assetsDestination" -ForegroundColor Green
Write-Host ""

# Copy model files
Write-Host "Copying model files..." -ForegroundColor Yellow

$modelFile = Join-Path $assetsSource "cyberbully_model.tflite"
$vocabFile = Join-Path $assetsSource "vocab.txt"

if (Test-Path $modelFile) {
    $modelSize = (Get-Item $modelFile).Length / 1MB
    Write-Host "  Copying cyberbully_model.tflite ($([math]::Round($modelSize, 2)) MB)..." -ForegroundColor White
    Copy-Item -Path $modelFile -Destination $assetsDestination -Force
    Write-Host "  ✓ Model file copied" -ForegroundColor Green
} else {
    Write-Host "  ✗ ERROR: Model file not found at $modelFile" -ForegroundColor Red
    exit 1
}

if (Test-Path $vocabFile) {
    $vocabSize = (Get-Item $vocabFile).Length / 1KB
    Write-Host "  Copying vocab.txt ($([math]::Round($vocabSize, 2)) KB)..." -ForegroundColor White
    Copy-Item -Path $vocabFile -Destination $assetsDestination -Force
    Write-Host "  ✓ Vocabulary file copied" -ForegroundColor Green
} else {
    Write-Host "  ✗ ERROR: Vocabulary file not found at $vocabFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Assets prepared successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Clean the build:" -ForegroundColor White
Write-Host "     cd android && ./gradlew clean && cd .." -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Build the APK:" -ForegroundColor White
Write-Host "     npx expo run:android --variant release" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Monitor BERT loading:" -ForegroundColor White
Write-Host "     adb logcat | Select-String 'BERT'" -ForegroundColor Gray
Write-Host ""
