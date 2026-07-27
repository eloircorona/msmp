// Application — comandos de economía
// /saldo y /pagar — sin restricción de permiso (todos los jugadores).
//
// Depósito y retiro: disponibles en msmp:mesa_banco (ver bank_handler.js).
// Transferencias entre jugadores: /pagar <jugador> <cantidad>.

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  // ── /saldo [<jugador>] ────────────────────────────────────────────────────
  event.register(
    Commands.literal('saldo')
      .executes(ctx => {
        const player = ctx.source.player
        if (!player) { ctx.source.sendFailure(Text.red('Ejecuta desde el juego.')); return 0 }
        ctx.source.sendSuccess(() =>
          Text.empty()
            .append(Text.gray('Saldo: '))
            .append(EconomyService.balanceText(player)),
          false
        )
        return 1
      })
      .then(
        Commands.argument('jugador', Arguments.PLAYER.create(event))
          .executes(ctx => {
            const target = Arguments.PLAYER.getResult(ctx, 'jugador')
            ctx.source.sendSuccess(() =>
              Text.empty()
                .append(Text.white(target.name.string + ': '))
                .append(EconomyService.balanceText(target)),
              false
            )
            return 1
          })
      )
  )

  // ── /pagar <jugador> <cantidad> ───────────────────────────────────────────
  event.register(
    Commands.literal('pagar')
      .then(
        Commands.argument('jugador', Arguments.PLAYER.create(event))
          .then(
            Commands.argument('cantidad', Arguments.WORD.create(event))
              .executes(ctx => {
                const sender = ctx.source.player
                if (!sender) { ctx.source.sendFailure(Text.red('Ejecuta desde el juego.')); return 0 }

                const target = Arguments.PLAYER.getResult(ctx, 'jugador')
                const raw    = ctx.getArgument('cantidad', String)
                const amount = parseInt(raw, 10)

                if (isNaN(amount) || amount <= 0) {
                  ctx.source.sendFailure(MText.system('Escribe una cantidad válida.'))
                  return 0
                }
                if (target.uuid === sender.uuid) {
                  ctx.source.sendFailure(MText.system('No puedes pagarte a ti mismo.'))
                  return 0
                }

                const result = EconomyService.transfer(sender, target, amount)
                if (!result.ok) {
                  ctx.source.sendFailure(
                    Text.empty()
                      .append(Text.gray('Saldo insuficiente. Tienes: '))
                      .append(EconomyService.balanceText(sender))
                  )
                  return 0
                }

                ctx.source.sendSuccess(() =>
                  Text.empty()
                    .append(Text.gray('Pagaste '))
                    .append(EconomyService.amountText(amount))
                    .append(Text.gray(' a '))
                    .append(Text.white(target.name.string))
                    .append(Text.gray('. Saldo: '))
                    .append(EconomyService.balanceText(sender)),
                  false
                )
                target.tell(
                  Text.empty()
                    .append(Text.white(sender.name.string))
                    .append(Text.gray(' te envió '))
                    .append(EconomyService.amountText(amount))
                    .append(Text.gray('. Saldo: '))
                    .append(EconomyService.balanceText(target))
                )
                return 1
              })
          )
      )
  )
})
