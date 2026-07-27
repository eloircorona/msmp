// MSMP — Economy domain service
// Wallet virtual en esmeraldas. Sin event registration.
// La moneda física son esmeraldas (minecraft:emerald).
// La wallet es un entero en persistentData del jugador.

const EconomyService = {
  getBalance: (player) => {
    return Math.max(0, player.persistentData.getInt(MSMP.KEYS.WALLET) || 0)
  },

  // Añade `amount` al saldo. No valida origen — la validación es responsabilidad del llamador.
  add: (player, amount) => {
    const current = EconomyService.getBalance(player)
    player.persistentData.putInt(MSMP.KEYS.WALLET, current + Math.max(0, Math.floor(amount)))
  },

  // Resta hasta `amount` del saldo. Devuelve lo que realmente restó (puede ser menor si no alcanza).
  subtract: (player, amount) => {
    const current = EconomyService.getBalance(player)
    const deduct  = Math.min(current, Math.max(0, Math.floor(amount)))
    player.persistentData.putInt(MSMP.KEYS.WALLET, current - deduct)
    return deduct
  },

  // Transfiere entre jugadores. Devuelve { ok: true } o { ok: false, reason: string }.
  transfer: (from, to, amount) => {
    const amt = Math.max(0, Math.floor(amount))
    if (amt <= 0)                              return { ok: false, reason: 'zero' }
    if (EconomyService.getBalance(from) < amt) return { ok: false, reason: 'insufficient' }
    EconomyService.subtract(from, amt)
    EconomyService.add(to, amt)
    return { ok: true }
  },

  // Componente de texto con el saldo formateado: "42 ◆"
  balanceText: (player) => {
    const bal = EconomyService.getBalance(player)
    return Text.empty()
      .append(Text.gold(bal + ' '))
      .append(Text.green(MSMP.ECONOMY.SYMBOL))
  },

  // "X ◆" sin referencia a jugador
  amountText: (amount) =>
    Text.empty()
      .append(Text.gold(Math.floor(amount) + ' '))
      .append(Text.green(MSMP.ECONOMY.SYMBOL)),
}
