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

  where git >nul 2>&1
  if not errorlevel 1 call :update

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
if not exist ".git" exit /b
set "APP_BRANCH="
for /f "delims=" %%I in ('git symbolic-ref --quiet HEAD') do set "APP_BRANCH=%%I"
if not "%APP_BRANCH%"=="refs/heads/main" exit /b
for /f "delims=" %%I in ('git status --porcelain --untracked-files^=no') do exit /b

(
  echo Suche nach Updates ...
  git -c http.lowSpeedLimit=1 -c http.lowSpeedTime=5 pull --ff-only --no-rebase --no-autostash origin main
  if errorlevel 1 echo Starte die vorhandene Version.
  exit /b
)
