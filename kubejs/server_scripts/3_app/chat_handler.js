// Application — chat con prefijo de puesto
// Jugadores sin puesto usan el formato vanilla normal.

PlayerEvents.chat(event => {
  const role = RoleService.getCurrent(event.player)
  if (!role) return

  event.cancel()
  event.server.tell(MText.chatLine(role.key, event.player.name.string, event.message))
})
