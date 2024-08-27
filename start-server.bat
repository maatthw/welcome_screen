@echo off
cd /d "C:\Users\Matthew\tip_screen\welcome_screen"
start /b "" cmd /c "node server.mjs" 
timeout /t 5 > nul
start chrome --kiosk http://localhost:3000
exit