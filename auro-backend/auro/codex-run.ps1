$env:PATH = $env:PATH + ';C:\Windows\System32\WindowsPowerShell\v1.0'
.\mvnw.cmd spring-boot:run *>&1 | Tee-Object -FilePath run.log
exit $LASTEXITCODE
