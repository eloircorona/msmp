// Application — Periódico del pueblo
// Migrado y actualizado desde server_scripts/newspaper.js (API 1.21.1).
//
// Comandos:
//   /periodico set <edición>|<título>|<cuerpo>
//   /periodico info
//
// El jugador lee el periódico haciendo clic derecho sobre msmp:newspaper.

const NEWSPAPER_KEY = {
  EDITION: 'newspaper_edition',
  TITLE:   'newspaper_title',
  BODY:    'newspaper_body',
}

// ── Receta: 3 papel + 1 tintero → 1 periódico ────────────────────────────────
ServerEvents.recipes(event => {
  event.shapeless('msmp:newspaper', [
    'minecraft:paper',
    'minecraft:paper',
    'minecraft:paper',
    'minecraft:ink_sac',
  ])
})

// ── Clic derecho: abrir libro ─────────────────────────────────────────────────
ItemEvents.rightClicked('msmp:newspaper', event => {
  const player  = event.player
  const storage = event.server.persistentData

  const edition = storage.getString(NEWSPAPER_KEY.EDITION) || 'Edición 1'
  const title   = storage.getString(NEWSPAPER_KEY.TITLE)   || 'El Gacetero'
  const body    = storage.getString(NEWSPAPER_KEY.BODY)    || 'No hay noticias esta semana.'

  const book = Item.of('minecraft:written_book', {
    title:    title,
    author:   'Redacción MSMP',
    pages: [
      JSON.stringify([
        { text: `${edition}\n`, bold: true, color: 'dark_brown' },
        { text: `${title}\n\n`, underlined: true, color: 'black' },
        { text: body, color: 'dark_gray' },
      ]),
    ],
    resolved: true,
  })

  player.give(book)
  player.displayClientMessage(Text.gray(`[Periódico] ${title}`), true)
})

// ── Comando /periodico ────────────────────────────────────────────────────────
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  event.register(
    Commands.literal('periodico')
      // Admin (op 2) o jugador con puesto periodista
      .requires(src => {
        if (src.hasPermission(MSMP.PERM.ADMIN)) return true
        const p = src.player
        return p !== null && PlayerRepo.getRole(p) === 'periodista'
      })
      .then(
        Commands.literal('set')
          .then(
            Commands.argument('contenido', Arguments.GREEDY_STRING.create(event))
              .executes(ctx => {
                const raw    = ctx.getArgument('contenido', String)
                const parts  = raw.split('|').map(s => s.trim())
                const edition = parts[0] || 'Edición 1'
                const title   = parts[1] || 'Sin título'
                const body    = parts[2] || 'Sin contenido.'

                const storage = ctx.source.server.persistentData
                storage.putString(NEWSPAPER_KEY.EDITION, edition)
                storage.putString(NEWSPAPER_KEY.TITLE,   title)
                storage.putString(NEWSPAPER_KEY.BODY,    body)

                ctx.source.sendSuccess(() =>
                  MText.system(`Periódico publicado: ${title} (${edition})`),
                  true
                )
                // Notificación a todos los jugadores
                ctx.source.server.tell(MText.announce(`Nueva edición: ${title}`))
                return 1
              })
          )
      )
      .then(
        Commands.literal('info')
          .executes(ctx => {
            const storage = ctx.source.server.persistentData
            const edition = storage.getString(NEWSPAPER_KEY.EDITION) || '(sin publicar)'
            const title   = storage.getString(NEWSPAPER_KEY.TITLE)   || '(sin título)'
            ctx.source.sendSuccess(() =>
              MText.system(`Edición actual: ${edition} — ${title}`),
              false
            )
            return 1
          })
      )
  )
})
