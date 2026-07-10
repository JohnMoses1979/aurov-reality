$ErrorActionPreference = 'Stop'

param(
    [int]$Port = 8080,
    [string]$LogName = 'run.log',
    [string]$ErrLogName = 'run.err.log'
)

$env:PATH = $env:PATH + ';C:\Windows\System32\WindowsPowerShell\v1.0'

Start-Process `
  -FilePath '.\mvnw.cmd' `
  -ArgumentList 'spring-boot:run', "-Dspring-boot.run.arguments=--server.port=$Port" `
  -WorkingDirectory $PSScriptRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $PSScriptRoot $LogName) `
  -RedirectStandardError (Join-Path $PSScriptRoot $ErrLogName)
