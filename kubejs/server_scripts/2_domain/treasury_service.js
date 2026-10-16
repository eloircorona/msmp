// MSMP — Treasury domain service
// Fondo común del pueblo (en corcholatas), guardado en el persistentData del server.
// Se nutre de impuestos (ver bank_handler.js: impuesto al depósito).

const TreasuryService = {
  balance: (server) => ServerRepo.getInt(server, MSMP.KEYS.TREASURY),

  // Suma `amount` al fondo. Devuelve lo recaudado.
  collect: (server, amount) => {
    const amt = Math.max(0, Math.floor(amount))
    if (amt > 0) ServerRepo.setInt(server, MSMP.KEYS.TREASURY, TreasuryService.balance(server) + amt)
    return amt
  },
}
