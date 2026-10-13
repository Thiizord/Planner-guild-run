@echo off
title GuildRun Planner - Build Local
echo Construindo...
cd /d "%~dp0"
call npm run build
if %errorlevel% neq 0 (
  echo Erro no build!
  pause
  exit /b 1
)
echo.
echo  Build concluido! Abrindo dist\index.html...
start "" "dist\index.html"
pause
