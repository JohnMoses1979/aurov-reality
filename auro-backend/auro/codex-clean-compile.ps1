$env:PATH = $env:PATH + ';C:\Windows\System32\WindowsPowerShell\v1.0'
.\mvnw.cmd clean compile
exit $LASTEXITCODE
