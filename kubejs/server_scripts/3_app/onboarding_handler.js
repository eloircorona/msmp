// Application — eventos de join/leave
// Conecta los eventos de KubeJS con el dominio. Sin lógica propia.

PlayerEvents.loggedIn(event => {
  const player = event.player

  if (PlayerService.isFirstJoin(player)) {
    // Primer join: onboarding completo (libro + título + sonido)
    PlayerService.onboard(player)
  } else {
    // Joins siguientes: notificación sutil al servidor
    const role = RoleService.getCurrent(player)
    const line = Text.empty()
    if (role) line.append(MText.roleBadge(role.key)).append(Text.gray(' '))
    line.append(Text.gray(player.name.string + ' llegó al pueblo.'))
    event.server.tell(line)
  }
})

PlayerEvents.loggedOut(event => {
  const player = event.player
  const role = RoleService.getCurrent(player)
  const line = Text.empty()
  if (role) line.append(MText.roleBadge(role.key)).append(Text.gray(' '))
  line.append(Text.gray(player.name.string + ' dejó el pueblo.'))
  event.server.tell(line)
})
