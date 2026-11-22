@echo off
title Spotify Vibe MVP
echo ===================================================
echo Starting Spotify Vibe MVP Locally...
echo ===================================================

set "NODE_EXE=C:\Users\JAHNAVI\.gemini\antigravity\scratch\tools\node\node.exe"
if not exist "%NODE_EXE%" (
    set "NODE_EXE=node"
)

echo Starting backend and frontend servers...
echo Frontend & Callback: http://127.0.0.1:8080
echo Backend API:         http://127.0.0.1:3000
echo.
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080"

cd /d "%~dp0phase6\backend"
"%NODE_EXE%" server.js
pause
