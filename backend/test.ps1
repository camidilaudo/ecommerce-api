$BASE_URL = "http://localhost:8081/api"
$TOKEN = ""

Write-Host "=== 1. REGISTRANDO USUARIO ==="
$registerBody = @{
    nombreUsuario = "testuser"
    email = "test@example.com"
    password = "password123"
    nombre = "Test"
    apellido = "User"
    fechaNacimiento = "1990-01-01"
    sexo = "MASCULINO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
Write-Host "`n"

Write-Host "=== 2. LOGIN (OBTENER JWT) ==="
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$TOKEN = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -ContentType "application/json" -Body $loginBody

if (-not $TOKEN) {
    Write-Host "Error: No se pudo obtener el token JWT."
    exit 1
}
Write-Host "Token obtenido exitosamente!`n"

Write-Host "=== 3. CREANDO PRODUCTOS PARA TEST DE ORDENAMIENTO ==="
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$prodB = @{
    nombre = "Banana"
    precio = 10.5
    stock = 10
    descripcion = "Fruta amarilla"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/productos" -Method Post -Headers $headers -Body $prodB

$prodA = @{
    nombre = "Apple"
    precio = 5.0
    stock = 5
    descripcion = "Fruta roja"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/productos" -Method Post -Headers $headers -Body $prodA
Write-Host "`n"

Write-Host "=== 4. VERIFICANDO LISTADO (GET /productos) ==="
$productos = Invoke-RestMethod -Uri "$BASE_URL/productos" -Method Get
$productos | Select-Object id, nombre, stock
Write-Host "`n"

Write-Host "=== 5. AGREGANDO AL CARRITO (VALIDACION STOCK) ==="
# ID 2 is Apple
Invoke-RestMethod -Uri "$BASE_URL/carrito/agregar/2" -Method Post -Headers $headers
Write-Host "Apple agregada al carrito con éxito."

Write-Host "=== 6. CHECKOUT ==="
Invoke-RestMethod -Uri "$BASE_URL/carrito/checkout" -Method Post -Headers $headers
Write-Host "`n"

Write-Host "=== 7. VERIFICANDO REDUCCION DE STOCK (Apple) ==="
$apple = Invoke-RestMethod -Uri "$BASE_URL/productos/2" -Method Get
Write-Host "Stock actual de Apple: $($apple.stock)"
Write-Host "`n"
