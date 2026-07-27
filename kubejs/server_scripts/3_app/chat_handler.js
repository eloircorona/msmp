// Application — chat con prefijo de puesto
// bank_handler.js tiene prioridad si el jugador está en sesión bancaria.
// Jugadores sin puesto usan el formato vanilla normal.

PlayerEvents.chat(event => {
  // La sesión bancaria se gestiona en bank_handler.js, que se registra antes (b < c).
  if (BankRepo.isActive(event.player)) return

  const role = RoleService.getCurrent(event.player)
  if (!role) return

  event.cancel()
  event.server.tell(MText.chatLine(role.key, event.player.name.string, event.message))
})
