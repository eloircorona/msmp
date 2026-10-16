// Application — HUD: corcholatas + rol en la action bar
// Server-side (sin sync al cliente): refresca cada segundo la barra de estado de cada jugador.
// Alternativa más vistosa (overlay KubeUIHud) requiere sincronizar el saldo al cliente.

ServerEvents.tick(event => {
  if (event.server.tickCount % 20 !== 0) return   // 1 vez por segundo
  event.server.players.forEach(player => {
    const bal     = EconomyService.getBalance(player)
    const roleKey = PlayerRepo.getRole(player)
    const roleTxt = roleKey ? MSMP.ROLES[roleKey].label : 'Vecino'
    player.displayClientMessage(
      Text.empty()
        .append(Text.gold(bal + ' '))
        .append(Text.yellow(MSMP.ECONOMY.SYMBOL))
        .append(Text.gray('   •   '))
        .append(Text.aqua(roleTxt)),
      true,   // true = action bar
    )
  })
})
