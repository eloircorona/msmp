// Application — registro de comandos /msmp
// Punto de entrada único para Brigadier. Monta subárboles de cmd_admin.js y cmd_player.js.

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  const root = Commands.literal('msmp')

  buildAdminCmds(Commands, Arguments, event).forEach(sub => root.then(sub))
  buildPlayerCmds(Commands, Arguments, event).forEach(sub => root.then(sub))

  event.register(root)
})
