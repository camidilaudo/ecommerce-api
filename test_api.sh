#!/bin/bash

BASE_URL="http://localhost:8081/api"
TOKEN=""

echo "=== 1. REGISTRANDO USUARIO ==="
curl -X POST "$BASE_URL/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "nombreUsuario": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "nombre": "Test",
       "apellido": "User"
     }'
echo -e "\n"

echo "=== 2. LOGIN (OBTENER JWT) ==="
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }')

if [ -z "$TOKEN" ]; then
    echo "Error: No se pudo obtener el token JWT."
    exit 1
fi
echo "Token obtenido: $TOKEN"
echo -e "\n"

echo "=== 3. CREANDO PRODUCTOS PARA TEST DE ORDENAMIENTO ==="
# Producto B
curl -X POST "$BASE_URL/productos" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "nombre": "Banana",
       "precio": 10.5,
       "stock": 10,
       "descripcion": "Fruta amarilla",
       "usuario": {"id": 1}
     }'
# Producto A
curl -X POST "$BASE_URL/productos" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "nombre": "Apple",
       "precio": 5.0,
       "stock": 5,
       "descripcion": "Fruta roja",
       "usuario": {"id": 1}
     }'
echo -e "\n"

echo "=== 4. VERIFICANDO LISTADO ALFABÉTICO (GET /productos) ==="
curl -s -X GET "$BASE_URL/productos" | grep -o '"nombre":"[^"]*'
echo -e "\n"

echo "=== 5. AGREGANDO AL CARRITO (VALIDACIÓN DE STOCK) ==="
# Agregar 5 Apples (hay 5) -> OK
curl -X POST "$BASE_URL/carrito/agregar/2" -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Intentar agregar 1 más (no hay stock) -> DEBE FALLAR (400)
echo "Intentando agregar sin stock (esperado 400):"
curl -X POST "$BASE_URL/carrito/agregar/2" -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 6. CHECKOUT ==="
curl -X POST "$BASE_URL/carrito/checkout" -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 7. VERIFICANDO REDUCCIÓN DE STOCK (Apple debe ser 0) ==="
curl -s -X GET "$BASE_URL/productos/2" | grep -o '"stock":[^,]*'
echo -e "\n"
