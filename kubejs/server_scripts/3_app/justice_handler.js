// Application — justicia del pueblo: multas (policía) y robos (criminal)
// Gated por rol vía .requires. Las multas van a la tesorería; los robos, al criminal.

const hasRole = (player, roleKey) => PlayerRepo.getRole(player) === roleKey

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  // /multar <jugador> <cantidad> — solo policía. La multa va al fondo común.
  event.register(
    Commands.literal('multar')
      .requires(src => src.player && hasRole(src.player, 'policia'))
      .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
        .then(Commands.argument('cantidad', Arguments.WORD.create(event))
          .executes(ctx => {
            const officer = ctx.source.player
            const target  = Arguments.PLAYER.getResult(ctx, 'jugador')
            const amount  = parseInt(Arguments.WORD.getResult(ctx, 'cantidad'), 10)
            if (isNaN(amount) || amount <= 0) { ctx.source.sendFailure(MText.system('Cantidad inválida.')); return 0 }
            const fined = EconomyService.subtract(target, amount)
            TreasuryService.collect(target.server, fined)
            officer.tell(Text.gray('Multaste a ' + target.name.string + ' por ').append(EconomyService.amountText(fined)))
            target.tell(Text.red('La policía te multó: ').append(EconomyService.amountText(fined)).append(Text.red(' → tesorería')))
            return 1
          }))))

  // /robar <jugador> — solo criminal. 50% de éxito; roba hasta 20% del saldo.
  event.register(
    Commands.literal('robar')
      .requires(src => src.player && hasRole(src.player, 'criminal'))
      .then(Commands.argument('jugador', Arguments.PLAYER.create(event))
        .executes(ctx => {
          const thief  = ctx.source.player
          const target = Arguments.PLAYER.getResult(ctx, 'jugador')
          if (target.uuid === thief.uuid) { ctx.source.sendFailure(MText.system('No puedes robarte a ti mismo.')); return 0 }
          if (Math.random() < 0.5) {
            thief.tell(Text.red('¡Te atraparon robando! No conseguiste nada.'))
            target.tell(Text.gold('Atrapaste a ' + thief.name.string + ' intentando robarte.'))
            return 1
          }
          const loot = EconomyService.subtract(target, Math.ceil(EconomyService.getBalance(target) * 0.2))
          if (loot === 0) { thief.tell(MText.system(target.name.string + ' no tiene nada que robar.')); return 1 }
          EconomyService.add(thief, loot)
          thief.tell(Text.gray('Robaste ').append(EconomyService.amountText(loot)).append(Text.gray(' a ' + target.name.string)))
          target.tell(Text.red(thief.name.string + ' te robó ').append(EconomyService.amountText(loot)))
          return 1
        })))
})
