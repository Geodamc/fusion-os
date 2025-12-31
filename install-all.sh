#!/bin/bash
# Fusion OS Unified - Instalador Maestro
# Combina dependencias, permisos, sudoers y configuración de libvirt/storage

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

# Asegurar que el script corra desde su directorio
cd "$(dirname "$0")"

echo -e "${BLUE}🚀 Iniciando Instalación Completa de Fusion OS...${NC}"
CURRENT_USER=$(whoami)

# ==========================================
# 1. Instalación de Paquetes del Sistema
# ==========================================
echo -e "\n${YELLOW}📦 [1/6] Instalando Paquetes del Sistema (Pacman)...${NC}"
sudo pacman -S --needed --noconfirm \
    virt-manager \
    qemu-desktop \
    libvirt \
    edk2-ovmf \
    dnsmasq \
    bridge-utils \
    openbsd-netcat \
    swtpm \
    nodejs \
    npm

# ==========================================
# 2. Configuración de Servicios y Red
# ==========================================
echo -e "\n${YELLOW}🔧 [2/6] Configurando Servicios y Red...${NC}"

# Habilitar libvirtd
echo "   - Habilitando libvirtd..."
sudo systemctl enable --now libvirtd.service

# Deshabilitar Firewall (UFW)
echo "   - Deshabilitando UFW..."
sudo ufw disable

# Configurar red 'default' de libvirt
echo "   - Configurando red 'default'..."
sudo virsh net-autostart default || true
sudo virsh net-start default || true

# ==========================================
# 3. Configuración del Storage Pool (Default)
# ==========================================
echo -e "\n${YELLOW}💾 [3/6] Configurando Storage Pool 'default'...${NC}"
STORAGE_PATH="/var/lib/libvirt/images"

# Crear directorio físico
if [ ! -d "$STORAGE_PATH" ]; then
    echo "   - Creando directorio $STORAGE_PATH..."
    sudo mkdir -p "$STORAGE_PATH"
    sudo chmod 711 "$STORAGE_PATH"
fi

# Definir y arrancar el pool
echo "   - Registrando pool en virsh..."
sudo virsh pool-define-as default dir --target "$STORAGE_PATH" 2>/dev/null || echo "     * El pool ya estaba definido."
sudo virsh pool-build default 2>/dev/null
sudo virsh pool-start default 2>/dev/null
sudo virsh pool-autostart default

# ==========================================
# 4. Configuración de Permisos de Usuario y Sudoers
# ==========================================
echo -e "\n${YELLOW}🔐 [4/6] Configurando Permisos de Usuario y Sudoers...${NC}"

# A) Grupos de usuario
echo "   - Añadiendo a $CURRENT_USER a grupos (libvirt, kvm, input, disk)..."
sudo usermod -aG libvirt,kvm,input,disk "$CURRENT_USER"

# B) Configuración Sudoers (Passwordless)
SUDO_FILE="/etc/sudoers.d/fusion-os-config"
echo "   - Creando archivo sudoers: $SUDO_FILE..."
CMDS="/usr/bin/sed,/usr/bin/grub-mkconfig,/usr/bin/cp,/usr/bin/tee,/usr/bin/mkinitcpio,/usr/bin/qemu-img,/usr/bin/systemctl,/usr/bin/rmmod,/usr/bin/modprobe,/usr/bin/virsh,/usr/bin/loginctl"
CONTENT="$CURRENT_USER ALL=(ALL) NOPASSWD: $CMDS"
echo "$CONTENT" | sudo tee "$SUDO_FILE" > /dev/null
sudo chmod 440 "$SUDO_FILE"

# C) Essentials Storage (ISOs)
echo "   - Configurando almacenamiento para archivos esenciales (ISOs)..."
ESSENTIALS_PATH="/var/lib/libvirt/images/fusionos-essentials"
LOCAL_ESSENTIALS="./fusionos-essentials"
HOME_ESSENTIALS="$HOME/fusionos-essentials"

# Mover essentials si existe localmente o en el home antiguo
if [ -d "$LOCAL_ESSENTIALS" ]; then
    echo "     * Moviendo $LOCAL_ESSENTIALS a $ESSENTIALS_PATH..."
    sudo mkdir -p "/var/lib/libvirt/images"
    sudo mv "$LOCAL_ESSENTIALS" "$ESSENTIALS_PATH"
elif [ -d "$HOME_ESSENTIALS" ]; then
    echo "     * Moviendo $HOME_ESSENTIALS a $ESSENTIALS_PATH (migración)..."
    sudo mv "$HOME_ESSENTIALS" "$ESSENTIALS_PATH"
fi

# Asegurar permisos para QEMU/libvirt
if [ -d "$ESSENTIALS_PATH" ]; then
    echo "     * Ajustando permisos en $ESSENTIALS_PATH..."
    sudo chown -R root:root "$ESSENTIALS_PATH"
    sudo chmod -R 755 "$ESSENTIALS_PATH"
    # Dar permisos específicos a qemu si es necesario por ACL pero con 755 suele bastar en /var/lib/libvirt/images
    sudo setfacl -R -m u:qemu:rx "$ESSENTIALS_PATH" 2>/dev/null || true
fi

# ==========================================
# 5. Instalación de Dependencias del Proyecto (NPM)
# ==========================================
echo -e "\n${YELLOW}📦 [5/6] Instalando Dependencias del Proyecto (Node.js)...${NC}"

# Backend
if [ -d "server" ]; then
    echo "   - Instalando dependencias del Servidor..."
    cd server
    rm -rf node_modules package-lock.json
    npm install
    cd ..
else
    echo -e "${RED}❌ Error: No se encontró la carpeta 'server'!${NC}"
fi

# Frontend
if [ -d "client" ]; then
    echo "   - Instalando dependencias del Cliente..."
    cd client
    rm -rf node_modules package-lock.json
    npm install
    cd ..
else
    echo -e "${RED}❌ Error: No se encontró la carpeta 'client'!${NC}"
fi

# ==========================================
# 6. Finalización
# ==========================================
echo -e "\n${GREEN}✅ ¡Instalación Completa!${NC}"
echo -e "${BLUE}Estado del Pool:${NC}"
sudo virsh pool-list --all

echo -e "\n${RED}⚠️  IMPORTANTE:${NC} Se han modificado tus grupos de usuario."
echo -e "Debes ${RED}CERRAR SESIÓN y volver a entrar${NC} (o reiniciar) para que los cambios surtan efecto."
echo -e "Después de reiniciar, ejecuta: ./start-unified.sh"
