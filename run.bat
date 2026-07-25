@echo off
title CUET CBT Simulator Startup
echo ========================================================
echo   CUET NTA CBT EXAMINATION SIMULATOR ONE-CLICK LAUNCHER
echo ========================================================
echo.
echo [System] Booting local servers concurrently...
echo [System] Opening web practice portal in your browser...
echo.

:: Open default browser to the frontend mock exam portal
start "" "http://localhost:5173"

:: Execute concurrently server runner
npm run dev

pause
