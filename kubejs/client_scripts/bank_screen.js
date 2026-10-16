// Client — Pantalla del Banco del Pueblo (KubeUI)
//
// Banco virtual: muestra el saldo de corcholatas, permite pagar a otro jugador, y
// da acceso a tienda / historial / ranking. Sin depósito/retiro de items.
// El server abre con KubeUIActions.openRemote(player, 'msmp:bank', { balance }).
KubeUIRemoteScreens.register('msmp:bank', data => {
  const balance = data.getIntOr('balance', 0)
  let amount = ''
  let target = ''

  KubeUI.builder('Banco del Pueblo')
    .elementSize(240, 20)
    .label('saldo', '§6Tus corcholatas: §a' + balance + ' ◆')
    .divider()
    .label('payTitle', '§7Pagar a un compañero:')
    .textField('amount', '', 'Cantidad...', (ctx, v) => amount = v)
    .textField('target', '', 'Nombre del jugador...', (ctx, v) => target = v)
    .button('§aPagar', ctx => ctx.runServerAction('msmp:bank_pay', { amount: amount, target: target }))
    .divider()
    // Tienda deshabilitada temporalmente (reactivar descomentando):
    // .button('Tienda del pueblo', ctx => { ctx.close(); KubeUI.shop('msmp:tienda') })
    .button('Historial', ctx => { ctx.close(); KubeUI.currencyHistory('corcholatas') })
    .button('Ranking del pueblo', ctx => { ctx.close(); KubeUI.leaderboard('corcholatas') })
    .divider()
    .button('Cerrar', ctx => ctx.close())
    .open()
})
