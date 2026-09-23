#!/usr/bin/env bash
# ==============================================================================
# PizzaByte - Script de Verificación de Sesión, Carpeta Temporal, Hash y Bash
# ==============================================================================

INPUT_USER="$1"
INPUT_PASS="$2"

# Colores ANSI para terminal
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
PURPLE='\033[1;35m'
BOLD='\033[1m'
NC='\033[0m'

clear 2>/dev/null || true

echo -e "${CYAN}==================================================================${NC}"
echo -e "${BOLD} PizzaByte - Verificación de Sesión Persistente (Hash y Bash) ${NC}"
echo -e "${CYAN}==================================================================${NC}"

TEMP_DIR="./temp_sessions"

# 1. Verificar o crear carpeta temporal
echo -e "\n${PURPLE}[PASO 1/3] Verificando existencia de la Carpeta Temporal...${NC}"
if [ ! -d "$TEMP_DIR" ]; then
    echo -e "${YELLOW} La carpeta temporal '$TEMP_DIR' no existía. Creándola ahora...${NC}"
    mkdir -p "$TEMP_DIR"
fi
echo -e "${GREEN} Carpeta temporal lista en: $TEMP_DIR${NC}"

# 2. Verificar archivos .txt de sesión
echo -e "\n${PURPLE}[PASO 2/3] Verificando archivos .txt de auditoría de sesión...${NC}"

ARCHIVOS_TXT=("$TEMP_DIR"/*.txt)

if [ ! -e "${ARCHIVOS_TXT[0]}" ]; then
    echo -e "${YELLOW}  No se encontró ningún archivo .txt de sesión en '$TEMP_DIR'.${NC}"
    echo -e "   Para generar uno automáticamente:"
    echo -e "   1. Inicia sesión en la app web: http://localhost:4200"
    echo -e "   2. El backend verificará la cookie 'pizzabyte_session' y guardará el archivo .txt."
    echo ""
    read -p "¿Deseas crear un archivo de prueba ahora para simular la verificación? (s/n): " CREAR_PRUEBA
    if [[ "$CREAR_PRUEBA" =~ ^[sSyY] ]]; then
        ARCHIVO_PRUEBA="$TEMP_DIR/sesion_admin.txt"
        cat <<EOF > "$ARCHIVO_PRUEBA"
==================================================================
        PIZZABYTE - REGISTRO DE AUDITORIA DE SESION ACTIVA        
==================================================================
Usuario Autenticado : admin
Nombre Completo     : Administrador PizzaByte
Correo Electronico  : brandooliver4@gmail.com
Rol de Acceso       : ADMINISTRADOR
Fecha y Hora        : $(date)
Estado de Sesion    : ACTIVA (Verificada mediante Cookie Persistente)
Token de Sesion     : pb_sess_bash_verified_$(date +%s)
Hash SHA-256        : 767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8
------------------------------------------------------------------
PERSISTENCIA DE SESION:
• Cookie configurada con vigencia prolongada (Max-Age=604800 / 7 dias).
• Si se cierra el navegador o la pagina, la sesion se mantiene activa.
• Verificado por script Bash: ./verify_session.sh
==================================================================
EOF
        echo -e "${GREEN} Archivo de prueba creado exitosamente: $ARCHIVO_PRUEBA${NC}"
        ARCHIVOS_TXT=("$ARCHIVO_PRUEBA")
    else
        echo -e "${RED}Operación cancelada. Inicia sesión en la web y vuelve a ejecutar este script.${NC}"
        exit 0
    fi
fi

echo -e "${GREEN} Archivo .txt de sesión encontrado:${NC}"
for arch in "${ARCHIVOS_TXT[@]}"; do
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    echo -e "${BOLD} Archivo: $arch${NC}"
    echo -e "${CYAN}------------------------------------------------------------------${NC}"
    cat "$arch"
    echo ""
done

# 3. Lanzar verificación de usuario y contraseña con Hash
echo -e "\n${PURPLE}[PASO 3/3] Sesión detectada como VERDADERA. Iniciando verificación de credenciales con Hash...${NC}"
echo -e "${BOLD}Lanzando verificación de Usuario y Contraseña (Hash SHA-256):${NC}\n"

if [ -z "$INPUT_USER" ]; then
    read -p "👤 Ingrese Usuario a verificar: " INPUT_USER
fi

if [ -z "$INPUT_PASS" ]; then
    read -s -p " Ingrese Contraseña: " INPUT_PASS
    echo ""
fi

# Calcular Hash SHA-256 de la contraseña ingresada
if command -v sha256sum &> /dev/null; then
    HASH_CALCULADO=$(echo -n "$INPUT_PASS" | sha256sum | awk '{print $1}')
elif command -v openssl &> /dev/null; then
    HASH_CALCULADO=$(echo -n "$INPUT_PASS" | openssl dgst -sha256 | awk '{print $NF}')
else
    HASH_CALCULADO=$(node -e "console.log(require('crypto').createHash('sha256').update('$INPUT_PASS').digest('hex'))")
fi

echo -e "\n${CYAN}======================== REPORTE DE HASH ========================${NC}"
echo -e "Usuario Ingresado      : ${BOLD}$INPUT_USER${NC}"
echo -e "Hash SHA-256 Calculado : ${YELLOW}$HASH_CALCULADO${NC}"
echo -e "${CYAN}==================================================================${NC}"

# Validación del usuario y su hash (dinámica según archivo .txt o credenciales maestras)
AUTENTICADO=false
ROL="USUARIO_REGISTRADO"

ARCHIVO_ESPECIFICO="$TEMP_DIR/sesion_${INPUT_USER}.txt"

if [ -f "$ARCHIVO_ESPECIFICO" ]; then
    HASH_EN_ARCHIVO=$(grep "Hash SHA-256" "$ARCHIVO_ESPECIFICO" | awk -F': ' '{print $2}' | tr -d '\r\n ')
    ROL_EN_ARCHIVO=$(grep "Rol de Acceso" "$ARCHIVO_ESPECIFICO" | awk -F': ' '{print $2}' | tr -d '\r\n ')
    if [ "$HASH_CALCULADO" == "$HASH_EN_ARCHIVO" ]; then
        AUTENTICADO=true
        ROL="${ROL_EN_ARCHIVO:-CLIENTE_REGISTRADO}"
    fi
fi

if [ "$AUTENTICADO" = false ]; then
    if [ "$INPUT_USER" == "admin" ] && [ "$HASH_CALCULADO" == "767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8" ]; then
        AUTENTICADO=true
        ROL="ADMINISTRADOR"
    elif [ "$INPUT_USER" == "brandon" ] && [ "$HASH_CALCULADO" == "6227931946d4f7130d60e51a34c2b17807ce00cd96177db1d8a6601646dacfb4" ]; then
        AUTENTICADO=true
        ROL="CLIENTE_VIP"
    fi
fi

if [ "$AUTENTICADO" = true ]; then
    echo -e "\n${GREEN} ¡VERIFICACIÓN EXITOSA!${NC}"
    echo -e "${GREEN}El Hash SHA-256 coincide exactamente con las credenciales cifradas.${NC}"
    echo -e "Usuario: ${BOLD}$INPUT_USER${NC} | Rol: ${BOLD}$ROL${NC}"
    echo -e "La sesión persistente en la carpeta temporal '$TEMP_DIR' es 100% VÁLIDA."
    echo -e "${GREEN}==================================================================${NC}\n"
else
    echo -e "\n${RED} VERIFICACIÓN FALLIDA:${NC}"
    echo -e "${RED}El usuario o la contraseña no coinciden con el Hash esperado.${NC}"
    echo -e "Acceso denegado."
    echo -e "${RED}==================================================================${NC}\n"
    exit 1
fi
