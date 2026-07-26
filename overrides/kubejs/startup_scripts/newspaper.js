// MSMP Newspaper — item registration
StartupEvents.registry('item', event => {
  event.create('msmp:newspaper')
    .maxStackSize(16)
    .displayName('Newspaper')
    .tooltip('The latest news from the server.')
    .tooltip('§7Right-click to read.')
})
