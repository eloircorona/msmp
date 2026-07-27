// Registry — custom blocks for MSMP

StartupEvents.registry('block', event => {
  // Mesa de Redacción — donde se imprimen los periódicos manuscritos.
  // Requiere: sostener un libro firmado + tener papel en inventario → produce copias.
  // Textura placeholder: estantería vanilla. Reemplazar con assets propios en kubejs/assets/msmp/.
  event.create('msmp:mesa_de_redaccion')
    .displayName('Mesa de Redacción')
    .hardness(2.5)
    .resistance(3)
    .soundType('wood')
    .mapColor('wood')

  // Banco del Pueblo — interfaz chat-modal para depositar y retirar esmeraldas.
  // TODO upgrade: reemplazar por container custom con client_scripts (ver bank_handler.js).
  // Textura placeholder: lingotes de oro. Reemplazar con assets propios.
  event.create('msmp:mesa_banco')
    .displayName('Banco del Pueblo')
    .hardness(3)
    .resistance(6)
    .soundType('metal')
    .mapColor('gold')
})
