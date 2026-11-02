$routes = @('/', '/work', '/work/aura', '/about', '/cv', '/film', '/narrative', '/contact')
foreach ($route in $routes) {
    $url = 'http://127.0.0.1:4188' + $route
    try {
        $result = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Host ("{0}: {1}" -f $route $result.StatusCode)
    } catch {
        Write-Host ("{0}: ERROR {1}" -f $route $_.Exception.Message)
    }
}