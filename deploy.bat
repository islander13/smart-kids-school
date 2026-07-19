@echo off
REM ════════════════════════════════════════════════════════════
REM   SKS - Build + Deploy en un double-clic
REM ════════════════════════════════════════════════════════════
cd /d "%~dp0"
title SKS - Deploiement

echo.
echo ===========================================
echo   1/2  Build du site (npm run build)
echo ===========================================
call npm run build
if errorlevel 1 (
    echo.
    echo   [ECHEC] BUILD ECHOUE - deploiement annule.
    echo   Corrige les erreurs ci-dessus, puis relance.
    echo.
    pause
    exit /b 1
)
echo   [OK] Build reussi.

echo.
echo ===========================================
echo   2/2  Deploiement production (netlify)
echo ===========================================
call netlify deploy --prod
if errorlevel 1 (
    echo.
    echo   [ECHEC] DEPLOIEMENT ECHOUE.
    echo   Verifie ta connexion / ton login (netlify login).
    echo.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo   EN LIGNE !  https://smartkids-school.ch
echo ===========================================
echo.
pause
