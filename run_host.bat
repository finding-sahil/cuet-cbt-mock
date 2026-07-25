@echo off
title CUET NTA CBT LAN Host Console
color 0B
echo ========================================================
echo   CUET NTA CBT SIMULATOR - LOCAL NETWORK (LAN) HOSTING
echo ========================================================
echo.

:: Detect the local IPv4 address
echo [System] Analyzing network adapters for local IP address...
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress"`) do set LOCAL_IP=%%i

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=localhost
    echo [Warning] Could not automatically detect local network IP. Falling back to localhost.
) else (
    echo [Success] Active local network adapter located at: %LOCAL_IP%
)

echo.
echo --------------------------------------------------------
echo   CLICKABLE ACCESS LINKS FOR YOUR DEVICES ON SAME WI-FI
echo --------------------------------------------------------
echo.
echo   [Workstation]  http://%LOCAL_IP%:5173
echo   [Invigilator]  http://%LOCAL_IP%:5173 (Select "System Console" link)
echo   [Express API]  http://%LOCAL_IP%:5000
echo.
echo --------------------------------------------------------
echo.
echo [System] Booting servers in LAN mode... Exposing port 5173 and 5000.
echo.

npm run host

pause
