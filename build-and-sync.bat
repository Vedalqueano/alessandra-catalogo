@echo off
echo ==============================================
echo   Star Bella - Build e Sincronizar com APK
echo ==============================================
echo.

echo [1/3] Gerando build de producao...
call npm run build
if %errorlevel% neq 0 (
    echo ERRO no build! Verifique os erros acima.
    pause
    exit /b 1
)

echo.
echo [2/3] Copiando arquivos para star-bella...
robocopy ".\src" "..\star-bella\src" /E /IS /IT /NFL /NDL /NJH /NJS
robocopy ".\dist" "..\star-bella\dist" /E /IS /IT /NFL /NDL /NJH /NJS
robocopy ".\public" "..\star-bella\public" /E /IS /IT /NFL /NDL /NJH /NJS

echo.
echo [3/3] Sincronizando com o Android...
cd /d "..\star-bella"
npx cap sync android

echo.
echo ==============================================
echo  Pronto! Agora gere o APK no Android Studio.
echo  Build > Build Bundle / APK > Build APK(s)
echo ==============================================
pause
