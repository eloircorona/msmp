// MSMP — Economy domain service
// Adaptador sobre la ÚNICA moneda del servidor: 'corcholatas' (gestionada por KubeUI).
// La wallet la lleva KubeUI (balance/pay/charge), no persistentData. Beneficio: /money,
// historial (KubeUI.currencyHistory) y leaderboard (KubeUI.leaderboard) gratis.
// La moneda física para depositar en el banco son esmeraldas, 1:1 (ver bank_handler.js).

const CURRENCY = 'corcholatas'
KubeUIActions.registerCurrency(CURRENCY)
KubeUIActions.setCurrencyTransferTax(CURRENCY, MSMP.ECONOMY.TAX.TRANSFER)  // comisión /money pay → impuesto

const EconomyService = {
  getBalance: (player) => KubeUIActions.balance(player, CURRENCY),

  // Añade `amount` al saldo. No valida origen — responsabilidad del llamador.
  add: (player, amount) => {
    const amt = Math.max(0, Math.floor(amount))
    if (amt > 0) KubeUIActions.pay(player, CURRENCY, amt)
  },

  // Resta hasta `amount` del saldo. Devuelve lo que realmente restó.
  subtract: (player, amount) => {
    const deduct = Math.min(EconomyService.getBalance(player), Math.max(0, Math.floor(amount)))
    if (deduct > 0) KubeUIActions.charge(player, CURRENCY, deduct)
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
  balanceText: (player) =>
    Text.empty()
      .append(Text.gold(EconomyService.getBalance(player) + ' '))
      .append(Text.yellow(MSMP.ECONOMY.SYMBOL)),

  // "X ◆" sin referencia a jugador
  amountText: (amount) =>
    Text.empty()
      .append(Text.gold(Math.floor(amount) + ' '))
      .append(Text.yellow(MSMP.ECONOMY.SYMBOL)),
}
