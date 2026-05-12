@echo off
title Tracko Production Server
echo ==========================================
echo    TRACKO - ИНВЕНТАРИЗАЦИЯ (PROD)
echo ==========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ошибка: Python не установлен или не добавлен в PATH.
    pause
    exit /b
)

echo [+] Установка зависимостей...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo [+] Запуск сервера...
echo [!] Откройте в браузере: http://localhost:5000
echo.

python app.py
pause
