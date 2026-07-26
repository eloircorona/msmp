// MSMP Newspaper — server logic
//
// Commands:
//   /kubejs run newspaper_set <edition> <title> <line1> [line2] [line3]...
//   Gives a newspaper to a player: /give <player> msmp:newspaper
//
// Storage: persists edition content in world data (survives restarts)

const NEWSPAPER_TAG = 'msmp:newspaper_content'

// ── Craft recipe ─────────────────────────────────────────────────────────────
ServerEvents.recipes(event => {
  // 3 paper + 1 ink sac → 1 newspaper (shapeless)
  event.shapeless('msmp:newspaper', ['minecraft:paper', 'minecraft:paper', 'minecraft:paper', 'minecraft:ink_sac'])
})

// ── Right-click to read ───────────────────────────────────────────────────────
ItemEvents.rightClicked('msmp:newspaper', event => {
  const player = event.player
  const storage = event.server.persistentData

  const edition = storage.getString('newspaper_edition') || 'Edición 1'
  const title   = storage.getString('newspaper_title')   || 'MSMP Times'
  const body    = storage.getString('newspaper_body')    || 'No hay noticias esta semana.'

  // Open a book-like screen by giving a temporary written book
  const book = Item.of('minecraft:written_book', {
    title:  title,
    author: 'MSMP Staff',
    pages: [
      JSON.stringify([
        { text: `§l${edition}\n`, color: 'dark_gray' },
        { text: `§n${title}\n\n`, color: 'black' },
        { text: body, color: 'dark_gray' }
      ])
    ],
    resolved: true
  })

  player.openHandledScreen = undefined  // KubeJS opens book via inventory trick
  player.give(book)
  player.tell(`§7[MSMP] Abriendo: §f${title}`)
})

// ── Op command: /kubejs run newspaper_publish ─────────────────────────────────
// Usage from server console or op:
//   /kubejs run newspaper_publish
// Then edit overrides/kubejs/server_scripts/newspaper_content.js with the content

// ── Op command via custom command ────────────────────────────────────────────
ServerEvents.commandRegistration(event => {
  const { literal, greedyString, argument } = event.commands

  event.register(
    literal('newspaper')
      .requires(src => src.hasPermission(2)) // op level 2
      .then(
        literal('set')
          .then(
            argument('edition', greedyString())
              .executes(ctx => {
                // /newspaper set <edition>|<title>|<body>
                // Separate fields with | for simplicity
                const raw     = ctx.getArgument('edition', String)
                const parts   = raw.split('|').map(s => s.trim())
                const edition = parts[0] || 'Edición 1'
                const title   = parts[1] || 'Sin título'
                const body    = parts[2] || 'Sin contenido.'

                const storage = ctx.source.server.persistentData
                storage.putString('newspaper_edition', edition)
                storage.putString('newspaper_title', title)
                storage.putString('newspaper_body', body)

                ctx.source.sendSuccess(
                  Text.of(`§a[MSMP Newspaper] Publicado: §f${title} §7(${edition})`),
                  true
                )
                return 1
              })
          )
      )
      .then(
        literal('info')
          .executes(ctx => {
            const storage = ctx.source.server.persistentData
            const edition = storage.getString('newspaper_edition') || '(sin publicar)'
            const title   = storage.getString('newspaper_title')   || '(sin título)'
            ctx.source.sendSuccess(
              Text.of(`§7[MSMP Newspaper] Edición actual: §f${edition} — ${title}`),
              false
            )
            return 1
          })
      )
  )
})
