# Build and package PCF control release

Write-Host "Building PCF control..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Building solution package..." -ForegroundColor Cyan
msbuild Solution\AddressFinderControlAU\AddressFinderControlAU.cdsproj /t:build /restore /p:configuration=Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "Solution build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Copying release package..." -ForegroundColor Cyan
$releaseDir = Join-Path $PSScriptRoot "Release"
$sourceZip = Join-Path $PSScriptRoot "Solution\AddressFinderControlAU\bin\Release\AddressFinderControlAU.zip"

if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir | Out-Null
}

Copy-Item $sourceZip $releaseDir -Force

Write-Host "Release package created successfully at $releaseDir\AddressFinderControlAU.zip" -ForegroundColor Green
