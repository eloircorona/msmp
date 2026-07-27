// Registry — custom items for MSMP
// Add all custom item definitions here. Keep one create() per item.

StartupEvents.registry('item', event => {
  event.create('msmp:newspaper')
    .maxStackSize(16)
    .displayName('Periódico')
    .tooltip('Las últimas noticias del pueblo.')
    .tooltip('§7Clic derecho para leer.')

  // Pluma de tinta — necesaria para escribir. Reemplaza la pluma vanilla en recetas de escritura.
  event.create('msmp:pluma')
    .maxStackSize(8)
    .displayName('Pluma de Tinta')
    .tooltip('Con esto se escriben historias.')
    .tooltip('§7Se fabrica con una pluma y un frasco de tinta.')
})
