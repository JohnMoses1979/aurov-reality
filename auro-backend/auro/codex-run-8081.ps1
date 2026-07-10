$ErrorActionPreference = 'Stop'

$env:PATH = $env:PATH + ';C:\Windows\System32\WindowsPowerShell\v1.0'

Start-Process `
  -FilePath '.\mvnw.cmd' `
  -ArgumentList 'spring-boot:run', '-Dspring-boot.run.arguments=--server.port=8081' `
  -WorkingDirectory $PSScriptRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $PSScriptRoot 'run-8081.log') `
  -RedirectStandardError (Join-Path $PSScriptRoot 'run-8081.err.log')
