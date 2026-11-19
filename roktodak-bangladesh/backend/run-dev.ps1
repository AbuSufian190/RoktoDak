$ErrorActionPreference = 'Stop'

$envFile = Join-Path $PSScriptRoot '.env.local'
if (-not (Test-Path $envFile)) {
    $jwtBytes = New-Object byte[] 32
    $passwordBytes = New-Object byte[] 24
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $random.GetBytes($jwtBytes)
        $random.GetBytes($passwordBytes)
    }
    finally {
        $random.Dispose()
    }

    $jwtSecret = [BitConverter]::ToString($jwtBytes).Replace('-', '')
    $adminPassword = [BitConverter]::ToString($passwordBytes).Replace('-', '')
    @(
        "JWT_SECRET=$jwtSecret"
        'ADMIN_EMAIL=admin@localhost'
        "ADMIN_PASSWORD=$adminPassword"
    ) | Set-Content -Path $envFile -Encoding ASCII
}

$settings = Get-Content -Path $envFile -Raw | ConvertFrom-StringData
foreach ($key in @('JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')) {
    if (-not $settings.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($settings[$key])) {
        throw "Missing $key in $envFile. Remove the file and rerun this script to generate local values."
    }
}

$env:JWT_SECRET = $settings['JWT_SECRET']
$env:ADMIN_EMAIL = $settings['ADMIN_EMAIL']
$env:ADMIN_PASSWORD = $settings['ADMIN_PASSWORD']

Write-Host "Local admin: $env:ADMIN_EMAIL"
Write-Host "Local admin password: $env:ADMIN_PASSWORD"
Write-Host 'Local database: backend\data\roktodak.mv.db'

Push-Location $PSScriptRoot
try {
    & (Join-Path $PSScriptRoot 'mvnw.cmd') -Plocal-dev spring-boot:run '-Dspring-boot.run.profiles=dev'
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
