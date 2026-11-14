@echo off
setlocal
pushd "%~dp0" || exit /b 1

set "CHROME_EXE="
for %%I in ("%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe") do (
  if not defined CHROME_EXE if exist "%%~I" set "CHROME_EXE=%%~I"
)

rem Read this block before Git can replace the starter during an update.
(
  set "GIT_TERMINAL_PROMPT=0"
  set "GCM_INTERACTIVE=never"
  set "GIT_OPTIONAL_LOCKS=0"
  set "STARTER_LOG=%~dp0starter.log"

  where git >nul 2>&1
  if errorlevel 1 (
    call :log "Git ist nicht installiert oder nicht im Pfad - kein Update."
  ) else (
    call :update
  )

  if not exist "index.html" (
    echo index.html fehlt. Bitte den Starter im App-Ordner ablegen.
    pause
    exit /b 1
  )
  if defined CHROME_EXE (
    start "" "%CHROME_EXE%" --autoplay-policy=no-user-gesture-required "%CD%\index.html" || exit /b 1
  ) else (
    start "" "%CD%\index.html" || exit /b 1
  )
  popd
  exit /b 0
)

:update
if not exist ".git" (
  call :log "Kein .git-Ordner - Updates brauchen eine Git-Kopie des Projekts."
  exit /b
)
set "APP_BRANCH="
for /f "delims=" %%I in ('git symbolic-ref --quiet HEAD') do set "APP_BRANCH=%%I"
if not "%APP_BRANCH%"=="refs/heads/main" (
  call :log "Der Ordner steht nicht auf main (%APP_BRANCH%) - kein Update."
  exit /b
)
for /f "delims=" %%I in ('git status --porcelain --untracked-files^=no') do (
  call :log "Lokale Aenderungen an verwalteten Dateien - kein Update."
  >>"%STARTER_LOG%" echo   %%I
  exit /b
)
(
  call :log "Suche nach Updates ..."
  git -c http.lowSpeedLimit=1 -c http.lowSpeedTime=5 pull --ff-only --no-rebase --no-autostash origin main >>"%STARTER_LOG%" 2>&1
  if errorlevel 1 (
    call :log "Update fehlgeschlagen - Starte die vorhandene Version."
  ) else (
    call :log "Update geprueft."
  )
  exit /b
)

:log
echo %~1
>>"%STARTER_LOG%" echo %date% %time% - %~1
exit /b
