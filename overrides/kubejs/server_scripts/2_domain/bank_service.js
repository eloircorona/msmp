// MSMP — Bank domain service
// Lógica de sesión bancaria: apertura, parsing de input, depósito y retiro.
// Sin event registration — los eventos están en bank_handler.js.
//
// Flujo:
//   1. Jugador abre sesión → BankService.openSession(player)
//   2. Jugador escribe en chat → BankService.processInput(player, message)
//   3. BankService procesa, confirma o responde con error
//   4. Sesión se cierra automáticamente después de la operación o por timeout

const BankService = {

  // Abre la sesión bancaria: muestra el "cajero" en chat y activa el modo.
  openSession: (player) => {
    BankRepo.setActive(player)

    player.tell(Text.gold('╔══ Banco del Pueblo ══════╗'))
    player.tell(
      Text.empty()
        .append(Text.gray('  Saldo: '))
        .append(EconomyService.balanceText(player))
    )
    player.tell(Text.gray('  ──────────────────────────'))
    player.tell(
      Text.empty()
        .append(Text.white('  dep <n>   '))
        .append(Text.gray('depositar esmeraldas'))
    )
    player.tell(
      Text.empty()
        .append(Text.white('  ret <n>   '))
        .append(Text.gray('retirar esmeraldas'))
    )
    player.tell(
      Text.empty()
        .append(Text.white('  cancelar  '))
        .append(Text.gray('cerrar'))
    )
    player.tell(Text.gold('╚══════════════════════════╝'))

    // Auto-cancelar después de 30 segundos (600 ticks) sin respuesta
    player.server.scheduleInTicks(600, player, ctx => {
      const p = ctx.data
      if (BankRepo.isActive(p)) {
        BankRepo.clearActive(p)
        p.tell(MText.system('Sesión bancaria cerrada (tiempo agotado).'))
      }
    })
  },

  // Procesa el mensaje del jugador cuando está en sesión bancaria.
  // Llamado desde bank_handler.js.
  processInput: (player, input) => {
    const msg = input.trim().toLowerCase()

    if (msg === 'cancelar') {
      BankRepo.clearActive(player)
      player.tell(MText.system('Sesión bancaria cerrada.'))
      return
    }

    const depMatch = msg.match(/^dep(?:ositar)?\s+(\d+)$/)
    const retMatch = msg.match(/^ret(?:irar)?\s+(\d+)$/)

    if (depMatch) {
      const amount = parseInt(depMatch[1], 10)
      const actual = BankService._deposit(player, amount)
      BankRepo.clearActive(player)
      if (actual === 0) {
        player.tell(MText.system(`No tienes esmeraldas en el inventario.`))
      } else {
        player.tell(
          Text.empty()
            .append(Text.gray('Depositaste '))
            .append(EconomyService.amountText(actual))
            .append(actual < amount ? Text.gray(` (solo tenías ${actual})`) : Text.empty())
            .append(Text.gray('. Saldo: '))
            .append(EconomyService.balanceText(player))
        )
      }
      return
    }

    if (retMatch) {
      const amount = parseInt(retMatch[1], 10)
      const actual = EconomyService.subtract(player, amount)
      BankRepo.clearActive(player)
      if (actual === 0) {
        player.tell(
          Text.empty()
            .append(Text.gray('Saldo insuficiente. Tienes: '))
            .append(EconomyService.balanceText(player))
        )
      } else {
        player.give(Item.of(MSMP.ECONOMY.CURRENCY_ITEM, actual))
        player.tell(
          Text.empty()
            .append(Text.gray('Retiraste '))
            .append(EconomyService.amountText(actual))
            .append(actual < amount ? Text.gray(` (saldo insuficiente)`) : Text.empty())
            .append(Text.gray('. Saldo: '))
            .append(EconomyService.balanceText(player))
        )
      }
      return
    }

    // Comando no reconocido — no cerrar la sesión, dejar intentar de nuevo
    player.tell(MText.system('Escribe  dep <n>,  ret <n>  o  cancelar.'))
  },

  // Toma esmeraldas del inventario y las deposita en la wallet.
  // Devuelve la cantidad real depositada.
  _deposit: (player, requested) => {
    const available = Inventory.count(player, MSMP.ECONOMY.CURRENCY_ITEM)
    const amount    = Math.min(available, Math.max(0, requested))
    if (amount === 0) return 0
    Inventory.remove(player, MSMP.ECONOMY.CURRENCY_ITEM, amount)
    EconomyService.add(player, amount)
    return amount
  },
}
