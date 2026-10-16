// Application — tesorería del pueblo
// /tesoreria muestra el fondo común (se nutre de impuestos: depósitos + comisiones).

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event
  event.register(Commands.literal('tesoreria').executes(ctx => {
    const bal = TreasuryService.balance(ctx.source.server)
    ctx.source.sendSuccess(
      Text.empty()
        .append(Text.gray('Fondo común del pueblo: '))
        .append(Text.gold(bal + ' '))
        .append(Text.green(MSMP.ECONOMY.SYMBOL)), false)
    return 1
  }))
})
