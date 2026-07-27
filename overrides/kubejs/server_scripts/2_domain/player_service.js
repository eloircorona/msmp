// MSMP — Player domain service
// Lógica de ciclo de vida del jugador. Sin event registration.
// El "onboarding" se llama una sola vez: el primer join.

const PlayerService = {
  isFirstJoin: (player) => !PlayerRepo.hasFirstJoined(player),

  // Llamado en el primer join. Marca al jugador, da kit y muestra bienvenida.
  onboard: (player) => {
    PlayerRepo.markFirstJoined(player)
    PlayerService._giveActa(player)
    PlayerService._showWelcome(player)
  },

  _giveActa: (player) => {
    const book = Item.of('minecraft:written_book', {
      title: 'Acta Fundacional',
      author: 'Los Fundadores',
      pages: PlayerService._actaPages(),
      resolved: true,
    })
    player.give(book)
  },

  // Título de pantalla + sonido + mensaje de chat, escalonados en ticks.
  _showWelcome: (player) => {
    // 40t: título en pantalla (esperamos a que el mundo cargue)
    player.server.scheduleInTicks(40, player, ctx => {
      const p = ctx.data
      const name = p.name.string
      const srv = p.server
      srv.runCommandSilent(`title ${name} times 10 80 20`)
      srv.runCommandSilent(`title ${name} title ${JSON.stringify({ text: 'Nuevas Tierras', color: 'gold', bold: true })}`)
      srv.runCommandSilent(`title ${name} subtitle ${JSON.stringify({ text: 'Bienvenido, ' + name, color: 'white' })}`)
      // Sonido de logro — inmersivo, sin parecer pop-up de servidor
      srv.runCommandSilent(`execute at ${name} run playsound minecraft:ui.toast.challenge_complete master ${name} ~ ~ ~ 0.7 0.85`)
    })
    // 100t: mensaje sutil en chat
    player.server.scheduleInTicks(100, player, ctx => {
      ctx.data.tell(Text.gray('Hay un libro en tu mochila.'))
    })
  },

  // Contenido del Acta Fundacional. Diseñado para caber en páginas de libro (max ~256 chars por página).
  _actaPages: () => [
    // Portada
    JSON.stringify([
      { text: '\n\n' },
      { text: 'Acta Fundacional\n', bold: true, color: 'dark_brown' },
      { text: 'de las Nuevas Tierras\n\n', color: 'dark_gray' },
      { text: '— por los habitantes\nfundadores —', italic: true, color: 'gray' },
    ]),
    // Espíritu
    JSON.stringify([
      { text: 'Estas tierras son\nde todos los que\naquí habitamos.\n\n', color: 'dark_gray' },
      { text: 'Nadie manda sobre\nnadie. No hay señores\nni siervos.\n\n', color: 'dark_gray' },
      { text: 'Lo que uno levanta,\ntodos lo cuidan.', color: 'dark_gray' },
    ]),
    // Costumbres
    JSON.stringify([
      { text: 'Costumbres\ndel pueblo:\n\n', bold: true, color: 'dark_brown' },
      { text: '◆ ', color: 'gold' }, { text: 'Lo ajeno se respeta.\n', color: 'dark_gray' },
      { text: '◆ ', color: 'gold' }, { text: 'Lo comunal es de todos.\n', color: 'dark_gray' },
      { text: '◆ ', color: 'gold' }, { text: 'Los conflictos\n   se hablan.\n', color: 'dark_gray' },
      { text: '◆ ', color: 'gold' }, { text: 'El PvP requiere\n   acuerdo mutuo.\n', color: 'dark_gray' },
      { text: '◆ ', color: 'gold' }, { text: 'Exploración libre.', color: 'dark_gray' },
    ]),
    // Puestos
    JSON.stringify([
      { text: 'Con el tiempo, el pueblo\npuede otorgarte\nun cargo:\n\n', color: 'dark_gray' },
      { text: '⚑ ', color: 'gold' },    { text: 'Alcalde\n', color: 'dark_gray' },
      { text: '⚔ ', color: 'blue' },    { text: 'Policía\n', color: 'dark_gray' },
      { text: '⚡ ', color: 'yellow' }, { text: 'Energía\n', color: 'dark_gray' },
      { text: '⚙ ', color: 'gray' },    { text: 'Obras\n', color: 'dark_gray' },
      { text: '✿ ', color: 'green' },   { text: 'Chef\n', color: 'dark_gray' },
      { text: '☠ ', color: 'red' },     { text: 'Criminal', color: 'dark_gray' },
    ]),
    // Cierre
    JSON.stringify([
      { text: '\nLos cargos no\ndan ventaja.\n\n', color: 'dark_gray' },
      { text: 'Dan responsabilidad.', italic: true, color: 'dark_gray' },
      { text: '\n\n— Firmado por\nlos fundadores —\n\n', italic: true, color: 'gray' },
      { text: 'Temporada 2 · MSMP', color: 'gray' },
    ]),
  ],
}
