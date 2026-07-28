// Application — tracking events para misiones diarias
// Observa BlockEvents, EntityEvents e ItemEvents y delega a QuestService.

BlockEvents.broken(event => {
  const player = event.player
  const server = event.server
  if (!player) return
  QuestService.track(player, server, 'mine', event.block.id)
})

EntityEvents.death(event => {
  const player = event.source.player
  if (!player) return
  QuestService.track(player, player.server, 'kill', event.entity.type)
})

ItemEvents.crafted(event => {
  const player = event.player
  if (!player) return
  QuestService.track(player, player.server, 'craft', event.item.id, event.item.count)
})
