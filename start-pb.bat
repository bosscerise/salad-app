@echo off
cd /d "D:\shark\salad-app\backend\pb"
echo Set WshShell = CreateObject("WScript.Shell") > "D:\shark\salad-app\temp-pocketbase.vbs"
echo WshShell.Run chr(34) ^& "D:\shark\salad-app\backend\pb\pocketbase.exe"" serve --http=0.0.0.0:8090" ^& chr(34), 0 >> "D:\shark\salad-app\temp-pocketbase.vbs"
wscript "D:\shark\salad-app\temp-pocketbase.vbs"
timeout /t 1 >nul
del "D:\shark\salad-app\temp-pocketbase.vbs"