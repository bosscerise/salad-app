@echo off
taskkill /IM pocketbase.exe /F
taskkill /IM cloudflared.exe /F
echo Services stopped.
pause