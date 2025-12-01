# Enable Windows Long Path Support
# This script must be run as Administrator

Write-Host "Enabling Windows Long Path Support..." -ForegroundColor Cyan

try {
    # Enable long paths in registry
    New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                     -Name "LongPathsEnabled" `
                     -Value 1 `
                     -PropertyType DWORD `
                     -Force | Out-Null
    
    Write-Host "✅ Long path support enabled successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You may need to restart your computer for this change to take full effect." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After restarting, you can build your APK with:" -ForegroundColor Cyan
    Write-Host "  cd android" -ForegroundColor White
    Write-Host "  .\gradlew.bat assembleRelease" -ForegroundColor White
    
} catch {
    Write-Host "❌ Failed to enable long path support." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure you're running this script as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to the project folder and run: .\enable-long-paths.ps1" -ForegroundColor White
    exit 1
}
