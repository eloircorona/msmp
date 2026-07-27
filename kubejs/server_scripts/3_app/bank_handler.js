// Application — Banco del Pueblo
//
// Interfaz: chat-modal (ver BankService en 2_domain/bank_service.js).
//
// TODO — Upgrade a container custom (GUI real):
//   Requiere tres capas adicionales:
//   1. startup_scripts: StartupEvents.registry('menu_type', e => e.create('msmp:banco', 'generic_9x1'))
//   2. server_scripts:  ContainerEvents para detectar items puestos/sacados y actualizar wallet
//   3. client_scripts:  ClientEvents.paintScreen o GUI registrada para renderizar la interfaz
//   Complejidad estimada: ~250 líneas. Ver KubeJS docs: /wiki/events/ContainerEvents

// ── Receta: mesa_banco ────────────────────────────────────────────────────────
// 8 lingotes de oro + 1 cofre → Banco del Pueblo
ServerEvents.recipes(event => {
  event.shaped('msmp:mesa_banco', [
    'GGG',
    'GCG',
    'GGG',
  ], {
    G: 'minecraft:gold_ingot',
    C: 'minecraft:chest',
  })
})

// ── Clic derecho en la mesa: abrir sesión bancaria ────────────────────────────
BlockEvents.rightClicked('msmp:mesa_banco', event => {
  event.cancel()
  BankService.openSession(event.player)
})

// ── Captura de chat en sesión bancaria ────────────────────────────────────────
// Este handler se registra antes que chat_handler.js (b < c alfabéticamente).
// chat_handler.js revisa BankRepo.isActive() y cede si está activo.
PlayerEvents.chat(event => {
  if (!BankRepo.isActive(event.player)) return
  event.cancel()
  BankService.processInput(event.player, event.message)
})
