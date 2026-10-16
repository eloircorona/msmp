// Registry — custom blocks for MSMP

StartupEvents.registry('block', event => {
  // Banco del Pueblo — GUI de KubeUI (ver bank_handler.js / client_scripts/bank_screen.js).
  // Textura placeholder: lingotes de oro. Reemplazar con assets propios.
  event.create('msmp:mesa_banco')
    .displayName('Banco del Pueblo')
    .hardness(3)
    .resistance(6)
    .soundType('metal')
    .mapColor('gold')
})
