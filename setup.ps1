#!/usr/bin/env pwsh
# Billy LLM Quick Setup for Pentesters
# Created by BillyC0der

Write-Host "🎯 Billy LLM - Pentester Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray

# Check if Node.js is installed
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm packages are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if config exists
if (!(Test-Path "config.json")) {
    Write-Host "⚙️  Creating config file..." -ForegroundColor Yellow
    Copy-Item "config.example.json" "config.json"
    
    Write-Host "🔑 Please set your bearer token:" -ForegroundColor Cyan
    $token = Read-Host "Enter your Bearer token"
    
    if ($token) {
        node .\src\index.js config --token $token
        Write-Host "✅ Token configured!" -ForegroundColor Green
    }
}

# Create pentest-projects directory
if (!(Test-Path "pentest-projects")) {
    New-Item -ItemType Directory -Name "pentest-projects" | Out-Null
    Write-Host "📁 Created pentest-projects directory" -ForegroundColor Green
}

# Install billy-llm command globally for daily use
Write-Host "🔧 Installing billy-llm command globally..." -ForegroundColor Yellow
npm install -g .

# Verify global installation
if (Get-Command "billy-llm" -ErrorAction SilentlyContinue) {
    Write-Host "✅ billy-llm command installed globally!" -ForegroundColor Green
    Write-Host "   You can now use 'billy-llm' from anywhere in PowerShell" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Global installation may have failed. Try running manually: npm install -g ." -ForegroundColor Yellow
}

Write-Host "`n🚀 Setup complete! Available commands:" -ForegroundColor Green
Write-Host "  billy-llm i                  - Start interactive mode" -ForegroundColor Gray
Write-Host "  billy-llm i -s exploit.json  - Start with exploit schema" -ForegroundColor Gray
Write-Host "  billy-llm ask 'question'     - Ask a quick question" -ForegroundColor Gray
Write-Host "`n💡 In interactive mode, type 'help' for pentesting commands" -ForegroundColor Blue
Write-Host "   Example: /exploit sqli, /payload revshell, /recon target.com" -ForegroundColor Blue

Write-Host "`n🎯 Ready for pentesting automation!" -ForegroundColor Cyan
