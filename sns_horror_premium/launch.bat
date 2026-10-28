@echo off
cd /d "%~dp0"
if exist "index.html" (
    start "" "index.html"
) else (
    echo [ERROR] index.html not found!
    pause
)
