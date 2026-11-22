@echo off
setlocal EnableDelayedExpansion
set "APP_DIR=%~dp0"
set "STARTER_LOG=%APP_DIR%starter.log"
pushd "%APP_DIR%" || exit /b 1

set "CHROME_EXE="
for %%I in ("%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%LocalAppData%\Google\Chrome\Application\chrome.exe") do (
  if not defined CHROME_EXE if exist "%%~I" set "CHROME_EXE=%%~I"
)

rem Read this block before Git can replace the starter during an update.
(
  set "GIT_TERMINAL_PROMPT=0"
  set "GCM_INTERACTIVE=never"
  set "GIT_OPTIONAL_LOCKS=0"

  where git >nul 2>&1
  if errorlevel 1 (
    echo Git ist nicht installiert oder nicht im Pfad - kein Update.
    >>"!STARTER_LOG!" echo !date! !time! - Git ist nicht installiert oder nicht im Pfad - kein Update.
  ) else (
    call :update
  )

  if not exist "index.html" (
    echo index.html fehlt. Bitte den Starter im App-Ordner ablegen.
    popd
    exit /b 1
  )
  set "TARGET_URL=!APP_DIR!index.html"
  if defined CHROME_EXE (
    start "" "!CHROME_EXE!" --autoplay-policy=no-user-gesture-required "!TARGET_URL!"
  ) else (
    start "" "!TARGET_URL!"
  )
  set "START_ERR=!errorlevel!"
  popd
  exit /b !START_ERR!
)

:update
if not exist ".git" (
  echo Kein .git-Ordner - Updates brauchen eine Git-Kopie des Projekts.
  >>"!STARTER_LOG!" echo !date! !time! - Kein .git-Ordner - Updates brauchen eine Git-Kopie des Projekts.
  exit /b
)
set "APP_BRANCH="
for /f "delims=" %%I in ('git symbolic-ref --quiet HEAD') do set "APP_BRANCH=%%I"
if /i not "!APP_BRANCH!"=="refs/heads/main" (
  echo Der Ordner steht nicht auf main (!APP_BRANCH!^) - kein Update.
  >>"!STARTER_LOG!" echo !date! !time! - Der Ordner steht nicht auf main (!APP_BRANCH!^) - kein Update.
  exit /b
)
set "HAS_DIRTY="
for /f "delims=" %%I in ('git status --porcelain --untracked-files^=no 2^>nul') do (
  if not defined HAS_DIRTY (
    set "HAS_DIRTY=1"
    echo Lokale Aenderungen an verwalteten Dateien - kein Update.
    >>"!STARTER_LOG!" echo !date! !time! - Lokale Aenderungen an verwalteten Dateien - kein Update.
  )
  set "DIRTY_LINE=%%I"
  >>"!STARTER_LOG!" echo   !DIRTY_LINE!
)
if defined HAS_DIRTY exit /b
(
  echo Suche nach Updates ...
  >>"!STARTER_LOG!" echo !date! !time! - Suche nach Updates ...
  git -c http.lowSpeedLimit=1 -c http.lowSpeedTime=5 pull --ff-only --no-rebase --no-autostash origin main >>"!STARTER_LOG!" 2>&1
  if errorlevel 1 (
    echo Update fehlgeschlagen - Starte die vorhandene Version.
    >>"!STARTER_LOG!" echo !date! !time! - Update fehlgeschlagen - Starte die vorhandene Version.
  ) else (
    echo Update geprueft.
    >>"!STARTER_LOG!" echo !date! !time! - Update geprueft.
  )
  exit /b
)
