PACKWIZ := $(shell which packwiz 2>/dev/null || echo ~/.gvm/pkgsets/go1.23.5/global/bin/packwiz)
PRISM := flatpak run org.prismlauncher.PrismLauncher

.PHONY: up down restart logs console attach status update export client

# Levanta el servidor (build primero si hay cambios en el pack)
up:
	docker compose up -d
	@echo "Server starting... usa 'make logs' para ver el progreso"

# Detiene el servidor
down:
	docker compose down

# Reinicia solo el servidor de Minecraft (útil tras actualizar mods)
restart:
	docker compose restart mc

# Logs en tiempo real
logs:
	docker compose logs -f mc

# Consola interactiva del servidor (Ctrl+P Ctrl+Q para salir sin matar el server)
console:
	docker attach msmp-mc-1

# Estado de los contenedores
status:
	docker compose ps

# Actualiza todos los mods y reinicia el servidor
update:
	$(PACKWIZ) update --all
	docker compose restart mc
	@echo "Mods actualizados. Servidor reiniciando..."

# Exporta el pack para CurseForge
export:
	$(PACKWIZ) curseforge export
	@echo "Pack exportado. Busca el .zip en el directorio actual."

# Abre una shell en el contenedor del servidor
shell:
	docker compose exec mc bash

# Lanza el cliente (Prism Launcher, instancia MSMP)
# Sirve el pack localmente para que packwiz-installer sincronice los mods
client:
	@echo "Iniciando packwiz serve..."
	@cd $(dir $(abspath $(lastword $(MAKEFILE_LIST)))) && $(PACKWIZ) serve &
	@sleep 1
	$(PRISM) --launch MSMP --show-window; \
	pkill -f "packwiz serve" 2>/dev/null || true
