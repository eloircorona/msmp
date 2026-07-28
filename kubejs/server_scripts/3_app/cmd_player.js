// Application — subárboles de comandos de jugador
// Devuelve un array de nodos Brigadier para montar en /msmp.
// Sin restricciones de permiso — disponible para todos.

const buildPlayerCmds = (Commands, Arguments, event) => [

  // /msmp quien [<jugador>]
  Commands.literal('quien')
    .executes(ctx => {
      const player = ctx.source.player
      if (!player) {
        ctx.source.sendFailure(Text.red('Ejecuta este comando desde el juego.'))
        return 0
      }
      ctx.source.sendSuccess(() => RoleService.formatCard(player), false)
      return 1
    })
    .then(
      Commands.argument('jugador', Arguments.PLAYER.create(event))
        .executes(ctx => {
          const target = Arguments.PLAYER.getResult(ctx, 'jugador')
          ctx.source.sendSuccess(() => RoleService.formatCard(target), false)
          return 1
        })
    ),

  // /msmp puestos
  Commands.literal('puestos')
    .executes(ctx => {
      ctx.source.sendSuccess(() => MText.roleList(), false)
      return 1
    }),

  // /msmp misiones
  Commands.literal('misiones')
    .executes(ctx => {
      const player = ctx.source.player
      if (!player) { ctx.source.sendFailure(Text.red('Solo desde el juego.')); return 0 }
      const server    = ctx.source.server
      const ids       = QuestService.serverQuestIds(server)
      const questDefs = ids.map(id => MSMP.QUESTS.POOL.find(q => q.id === id))
      const data      = QuestService.playerData(player, server)
      ctx.source.sendSuccess(() => MText.questBoard(questDefs, data), false)
      return 1
    })
    .then(
      Commands.literal('reclamar')
        .then(
          Commands.argument('n', Arguments.INTEGER.create(event))
            .executes(ctx => {
              const player = ctx.source.player
              if (!player) { ctx.source.sendFailure(Text.red('Solo desde el juego.')); return 0 }
              const n      = Arguments.INTEGER.getResult(ctx, 'n')
              const result = QuestService.claim(player, ctx.source.server, n)
              if (!result.ok) {
                const msg = result.reason === 'already_claimed' ? 'Ya reclamaste esa misión.'
                          : result.reason === 'incomplete'      ? 'Aún no completaste esa misión.'
                          :                                       'Número de misión inválido (1-3).'
                ctx.source.sendFailure(MText.system(msg))
                return 0
              }
              player.tell(
                Text.empty()
                  .append(Text.green('¡Misión completada! +'))
                  .append(Text.gold(result.reward + ' '))
                  .append(Text.green(MSMP.ECONOMY.SYMBOL))
              )
              return 1
            })
        )
    ),
]
