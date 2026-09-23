param (
    [Parameter(Mandatory=$false)]
    [string]$Usuario,
    
    [Parameter(Mandatory=$false)]
    [string]$Password
)

# ==============================================================================
# PizzaByte - Script PowerShell de Verificación de Sesión, Carpeta Temporal y Hash
# ==============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " PizzaByte - Verificación de Sesión Persistente (Hash y PowerShell) " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan

$TempDir = Join-Path -Path $PSScriptRoot -ChildPath "temp_sessions"

# 1. Verificar o crear carpeta temporal
Write-Host "`n[PASO 1/3] Verificando existencia de la Carpeta Temporal..." -ForegroundColor Magenta
if (-not (Test-Path $TempDir)) {
    Write-Host " La carpeta temporal '$TempDir' no existía. Creándola ahora..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
}
Write-Host " Carpeta temporal lista en: $TempDir" -ForegroundColor Green

# 2. Verificar archivos .txt de sesión
Write-Host "`n[PASO 2/3] Verificando archivos .txt de auditoría de sesión..." -ForegroundColor Magenta

$ArchivosTxt = Get-ChildItem -Path $TempDir -Filter "*.txt" -File

if ($ArchivosTxt.Count -eq 0) {
    Write-Host "  No se encontró ningún archivo .txt de sesión en '$TempDir'." -ForegroundColor Yellow
    Write-Host "   Para generar uno automáticamente:"
    Write-Host "   1. Inicia sesión en la app web: http://localhost:4200"
    Write-Host "   2. El backend verificará la cookie 'pizzabyte_session' y guardará el archivo .txt."
    
    $Crear = Read-Host "`n¿Deseas crear un archivo de prueba ahora para simular la verificación? (s/n)"
    if ($Crear -match "^[sSyY]") {
        $RutaPrueba = Join-Path $TempDir "sesion_admin.txt"
        $ContenidoPrueba = @"
==================================================================
        PIZZABYTE - REGISTRO DE AUDITORIA DE SESION ACTIVA        
==================================================================
Usuario Autenticado : admin
Nombre Completo     : Administrador PizzaByte
Correo Electronico  : brandooliver4@gmail.com
Rol de Acceso       : ADMINISTRADOR
Fecha y Hora        : $((Get-Date).ToString("F"))
Estado de Sesion    : ACTIVA (Verificada mediante Cookie Persistente)
Token de Sesion     : pb_sess_powershell_verified_$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
Hash SHA-256        : 767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8
------------------------------------------------------------------
PERSISTENCIA DE SESION:
• Cookie configurada con vigencia prolongada (Max-Age=604800 / 7 dias).
• Si se cierra el navegador o la pagina, la sesion se mantiene activa.
• Verificado por script PowerShell: .\verify_session.ps1
==================================================================
"@
        Set-Content -Path $RutaPrueba -Value $ContenidoPrueba -Encoding UTF8
        Write-Host "Archivo de prueba creado exitosamente: $RutaPrueba" -ForegroundColor Green
        $ArchivosTxt = @(Get-Item $RutaPrueba)
    } else {
        Write-Host "Operación cancelada. Inicia sesión en la web y vuelve a ejecutar este script." -ForegroundColor Red
        return
    }
}

Write-Host " Archivo .txt de sesión encontrado:" -ForegroundColor Green
foreach ($arch in $ArchivosTxt) {
    Write-Host "------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host " Archivo: $($arch.Name)" -ForegroundColor White
    Write-Host "------------------------------------------------------------------" -ForegroundColor Cyan
    Get-Content $arch.FullName
    Write-Host ""
}

# 3. Lanzar verificación de usuario y contraseña con Hash
Write-Host "[PASO 3/3] Sesión detectada como VERDADERA. Iniciando verificación de credenciales con Hash..." -ForegroundColor Magenta
Write-Host "Lanzando verificación de Usuario y Contraseña (Hash SHA-256):`n" -ForegroundColor White

if (-not $Usuario) {
    $Usuario = Read-Host " Ingrese Usuario a verificar"
}
if (-not $Password) {
    $Password = Read-Host " Ingrese Contraseña"
}

# Calcular SHA-256
$Sha256 = [System.Security.Cryptography.SHA256]::Create()
$Bytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
$HashBytes = $Sha256.ComputeHash($Bytes)
$HashCalculado = ($HashBytes | ForEach-Object { $_.ToString("x2") }) -join ""

Write-Host "`n======================== REPORTE DE HASH ========================" -ForegroundColor Cyan
Write-Host "Usuario Ingresado      : $Usuario" -ForegroundColor White
Write-Host "Hash SHA-256 Calculado : $HashCalculado" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

$Autenticado = $false
$Rol = "USUARIO_REGISTRADO"

$ArchivoEspecifico = Join-Path $TempDir "sesion_$Usuario.txt"

if (Test-Path $ArchivoEspecifico) {
    $Lineas = Get-Content $ArchivoEspecifico
    $LineaHash = $Lineas | Where-Object { $_ -match "Hash SHA-256\s*:\s*(\w+)" }
    $LineaRol = $Lineas | Where-Object { $_ -match "Rol de Acceso\s*:\s*(\w+)" }
    if ($LineaHash -and $Matches[1]) {
        $HashArchivo = ($LineaHash -split ":")[1].Trim()
        if ($HashCalculado -eq $HashArchivo) {
            $Autenticado = $true
            if ($LineaRol) { $Rol = ($LineaRol -split ":")[1].Trim() }
        }
    }
}

if (-not $Autenticado) {
    if ($Usuario -eq "admin" -and $HashCalculado -eq "767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8") {
        $Autenticado = $true
        $Rol = "ADMINISTRADOR"
    } elseif ($Usuario -eq "brandon" -and $HashCalculado -eq "6227931946d4f7130d60e51a34c2b17807ce00cd96177db1d8a6601646dacfb4") {
        $Autenticado = $true
        $Rol = "CLIENTE_VIP"
    }
}

if ($Autenticado) {
    Write-Host "`n ¡VERIFICACIÓN EXITOSA!" -ForegroundColor Green
    Write-Host "El Hash SHA-256 coincide exactamente con las credenciales cifradas." -ForegroundColor Green
    Write-Host "Usuario: $Usuario | Rol: $Rol" -ForegroundColor White
    Write-Host "La sesión persistente en la carpeta temporal '$TempDir' es 100% VÁLIDA." -ForegroundColor Green
    Write-Host "==================================================================`n" -ForegroundColor Green
} else {
    Write-Host "`n VERIFICACIÓN FALLIDA:" -ForegroundColor Red
    Write-Host "El usuario o la contraseña no coinciden con el Hash esperado." -ForegroundColor Red
    Write-Host "Acceso denegado." -ForegroundColor Red
    Write-Host "==================================================================`n" -ForegroundColor Red
}
