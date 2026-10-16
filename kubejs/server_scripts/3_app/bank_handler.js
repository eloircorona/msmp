// Application — Banco del Pueblo (virtual)
//
// Corcholatas es moneda 100% virtual: se gana completando misiones. El banco NO
// usa ni entrega items — sirve para ver el saldo, PAGAR a otros jugadores (con un
// impuesto al fondo común) y acceder a tienda / historial / ranking.
// Pantalla en client_scripts/bank_screen.js.

// ── Receta: mesa_banco ────────────────────────────────────────────────────────
ServerEvents.recipes(event => {
  event.shaped('msmp:mesa_banco', [
    'GGG',
    'GCG',
    'GGG',
  ], {
    G: 'minecraft:gold_ingot',
    C: 'minecraft:chest',
  })
})

const bankScreenData = (player) => ({ balance: EconomyService.getBalance(player) })
const openBank = (player) => KubeUIActions.openRemote(player, 'msmp:bank', bankScreenData(player))
const readAmount = (data) => Math.max(0, parseInt(data.getStringOr('amount', '0'), 10) || 0)

// ── Clic derecho en la mesa / comando /bank ───────────────────────────────────
BlockEvents.rightClicked('msmp:mesa_banco', event => {
  event.cancel()
  openBank(event.player)
})

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event
  event.register(Commands.literal('bank').executes(ctx => {
    const player = ctx.source.player
    if (!player) { ctx.source.sendFailure(Text.red('Ejecuta esto desde el juego.')); return 0 }
    openBank(player)
    return 1
  }))
})

// ── Pagar a otro jugador (server-authoritative, con impuesto al fondo común) ───
KubeUIActions.register('msmp:bank_pay', (player, data) => {
  const amount     = readAmount(data)
  const targetName = data.getStringOr('target', '').trim()
  if (amount <= 0)  { player.tell(MText.system('Escribe una cantidad válida.')); openBank(player); return }
  if (!targetName)  { player.tell(MText.system('Escribe el nombre del jugador.')); openBank(player); return }
  const target = player.server.getPlayer(targetName)
  if (!target)      { player.tell(MText.system('Jugador no encontrado o desconectado.')); openBank(player); return }
  if (target.name.string === player.name.string) { player.tell(MText.system('No puedes pagarte a ti mismo.')); openBank(player); return }
  if (EconomyService.getBalance(player) < amount) { player.tell(MText.system('Saldo insuficiente.')); openBank(player); return }

  const tax = Math.floor(amount * MSMP.ECONOMY.TAX.TRANSFER)
  EconomyService.subtract(player, amount)
  EconomyService.add(target, amount - tax)
  TreasuryService.collect(player.server, tax)

  player.tell(Text.gray('Pagaste ').append(EconomyService.amountText(amount - tax))
    .append(Text.gray(' a ' + target.name.string + (tax > 0 ? ' (impuesto ' + tax + ' ◆ al pueblo)' : ''))))
  target.tell(Text.gray(player.name.string + ' te pagó ').append(EconomyService.amountText(amount - tax)))
  openBank(player)
})
