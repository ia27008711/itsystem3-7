@echo off
setlocal
set "GAME=%~dp0index.html"
set "CHROME="

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined CHROME (
  for /f "tokens=2,*" %%A in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| find /i "REG_SZ"') do set "CHROME=%%B"
)
if not defined CHROME (
  for /f "tokens=2,*" %%A in ('reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| find /i "REG_SZ"') do set "CHROME=%%B"
)

if defined CHROME if exist "%CHROME%" (
  start "" "%CHROME%" "%GAME%"
  exit /b 0
)

echo Google Chrome was not found. Opening with your default browser instead.
start "" "%GAME%"
endlocal