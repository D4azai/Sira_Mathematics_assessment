@echo off
cd /d "%~dp0"
"tools\node\node.exe" --env-file=.env.release.local scripts/retry-worker.mjs
pause
