@echo off
setlocal
set "MATHE_APP_FOLDER=%~dp0"

powershell.exe -NoProfile -NonInteractive -Command ^
  "$ErrorActionPreference = 'Stop';" ^
  "$name = 'Mathe ' + [char]252 + 'ben';" ^
  "$starter = Join-Path $env:MATHE_APP_FOLDER ($name + '.cmd');" ^
  "if (-not (Test-Path -LiteralPath $starter -PathType Leaf)) { throw 'Der Update-Starter fehlt im App-Ordner.' }" ^
  "$desktop = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory);" ^
  "if (-not (Test-Path -LiteralPath $desktop -PathType Container)) { throw 'Der Desktop-Ordner wurde nicht gefunden.' }" ^
  "$shell = New-Object -ComObject WScript.Shell;" ^
  "$shortcut = $shell.CreateShortcut((Join-Path $desktop ($name + '.lnk')));" ^
  "$shortcut.TargetPath = Join-Path ([Environment]::SystemDirectory) 'cmd.exe';" ^
  "$quotes = [string][char]34 + [char]34;" ^
  "$shortcut.Arguments = '/d /c ' + $quotes + $starter + $quotes;" ^
  "$shortcut.WorkingDirectory = $env:MATHE_APP_FOLDER;" ^
  "$shortcut.Description = $name + ' starten und nach Updates suchen';" ^
  "$icon = Join-Path $env:MATHE_APP_FOLDER 'bilder\mathe-rechenzeichen.ico';" ^
  "if (Test-Path -LiteralPath $icon -PathType Leaf) {" ^
  "  $iconFolder = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'MatheUeben';" ^
  "  [IO.Directory]::CreateDirectory($iconFolder) | Out-Null;" ^
  "  $localIcon = Join-Path $iconFolder 'mathe-rechenzeichen.ico';" ^
  "  Copy-Item -LiteralPath $icon -Destination $localIcon -Force;" ^
  "  $shortcut.IconLocation = $localIcon + ',0';" ^
  "}" ^
  "$shortcut.WindowStyle = 7;" ^
  "$shortcut.Save();"

if errorlevel 1 (
  echo Das Desktop-Symbol konnte nicht erstellt werden.
  pause
  exit /b 1
)
