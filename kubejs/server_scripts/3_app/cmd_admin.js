// Application — subárboles de comandos de admin
// Devuelve un array de nodos Brigadier para montar en /msmp.
// Todos requieren MSMP.PERM.ADMIN (op level 2).

const buildAdminCmds = (Commands, Arguments, event) => [

  // /msmp cargo <jugador> <puesto|quitar>
  Commands.literal('cargo')
    .requires(src => src.hasPermission(MSMP.PERM.ADMIN))
    .then(
      Commands.argument('jugador', Arguments.PLAYER.create(event))
        .then(
          Commands.argument('puesto', Arguments.WORD.create(event))
            .executes(ctx => {
              const target  = Arguments.PLAYER.getResult(ctx, 'jugador')
              const roleKey = ctx.getArgument('puesto', String)

              if (roleKey === 'quitar') {
                RoleService.remove(target)
                ctx.source.sendSuccess(() => MText.system(`Puesto removido de ${target.name.string}.`), true)
                target.tell(MText.system('Tu puesto fue removido.'))
                return 1
              }

              if (!RoleService.assign(target, roleKey)) {
                ctx.source.sendFailure(MText.system(
                  `Puesto desconocido: "${roleKey}". Válidos: ${Object.keys(MSMP.ROLES).join(', ')}, quitar`
                ))
                return 0
              }

              ctx.source.sendSuccess(() =>
                Text.empty()
                  .append(Text.gray(`Puesto de ${target.name.string}: `))
                  .append(MText.roleBadge(roleKey)),
                true
              )
              target.tell(
                Text.empty()
                  .append(Text.gray('El pueblo te otorgó el puesto de '))
                  .append(MText.roleBadge(roleKey))
                  .append(Text.gray('.'))
              )
              return 1
            })
        )
    ),

  // /msmp anuncio <mensaje>
  Commands.literal('anuncio')
    .requires(src => src.hasPermission(MSMP.PERM.ADMIN))
    .then(
      Commands.argument('mensaje', Arguments.GREEDY_STRING.create(event))
        .executes(ctx => {
          const msg = ctx.getArgument('mensaje', String)
          ctx.source.server.tell(MText.announce(msg))
          return 1
        })
    ),
]
