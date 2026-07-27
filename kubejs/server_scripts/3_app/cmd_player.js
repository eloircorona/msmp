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
]
