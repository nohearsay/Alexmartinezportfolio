$p=(Get-NetTCPConnection -State Listen -LocalPort 4188 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1
if($p){ Stop-Process -Id $p -Force }
Start-Process -WindowStyle Hidden node -ArgumentList 'node_modules/vite/bin/vite.js','preview','--outDir','dist_p5','--port','4188','--strictPort','--host','127.0.0.1'
Start-Sleep -Seconds 3
$status = (Invoke-WebRequest http://127.0.0.1:4188/ -UseBasicParsing).StatusCode
Write-Output "Status: $status"