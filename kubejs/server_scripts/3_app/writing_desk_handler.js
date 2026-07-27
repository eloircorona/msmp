// Application — Mesa de Redacción y cadena de crafteo de periódicos
//
// Cadena de crafteo:
//   1. msmp:pluma         = 1 feather + 1 ink_sac (shapeless)
//   2. minecraft:writable_book = 1 book + 1 msmp:pluma (reemplaza receta vanilla)
//   3. Escribe y firma el libro → minecraft:written_book
//   4. Lleva el libro firmado a msmp:mesa_de_redaccion + 5 papel en inventario
//   5. Clic derecho → 5 copias del libro (para distribuir por mailbox)
//   6. Receta de la mesa: 4 madera de planks + 2 libros + 1 tintero
//
// Flujo de la mesa:
//   - Jugador sostiene minecraft:written_book en mano principal
//   - Tiene >= MSMP.PRESS.PAPER_COST papel en inventario
//   - Resultado: MSMP.PRESS.COPIES copias del libro, consume papel + libro original

// ── Recetas ───────────────────────────────────────────────────────────────────
ServerEvents.recipes(event => {

  // Pluma de tinta
  event.shapeless('msmp:pluma', ['minecraft:feather', 'minecraft:ink_sac'])

  // Reemplazar receta vanilla de libro_y_pluma para requerir msmp:pluma
  event.remove({ output: 'minecraft:writable_book' })
  event.shapeless('minecraft:writable_book', ['minecraft:book', 'msmp:pluma'])

  // Mesa de redacción: 4 planchas + 2 libros + 1 pluma de tinta
  event.shaped('msmp:mesa_de_redaccion', [
    'PPP',
    'BPB',
    'PPP',
  ], {
    P: '#minecraft:planks',
    B: 'minecraft:book',
  })

})

// ── Interacción con la mesa ───────────────────────────────────────────────────
BlockEvents.rightClicked('msmp:mesa_de_redaccion', event => {
  const player = event.player
  const hand   = player.mainHandItem

  // Solo activa con libro firmado en mano principal
  if (!hand || hand.empty || hand.id !== 'minecraft:written_book') return

  const { COPIES, PAPER_COST } = MSMP.PRESS

  // Verificar papel en inventario
  if (!Inventory.has(player, 'minecraft:paper', PAPER_COST)) {
    player.tell(
      Text.empty()
        .append(Text.gray('Necesitas '))
        .append(Text.white(PAPER_COST + ' hojas de papel'))
        .append(Text.gray(' para imprimir.'))
    )
    return
  }

  event.cancel()

  // Extraer título del libro para el mensaje (best-effort: NBT puede no estar disponible en 1.21.1)
  let title = 'el periódico'
  try {
    const nbt = hand.nbt
    if (nbt) {
      const t = nbt.getString('title')
      if (t && t.length > 0) title = `"${t}"`
    }
  } catch (_) { /* NBT no accesible en esta versión — ignorar */ }

  // Consumir: papel + libro original
  Inventory.remove(player, 'minecraft:paper', PAPER_COST)
  hand.shrink(1)

  // Dar COPIES copias. hand.copy() preserva todo el NBT/data components del libro.
  for (let i = 0; i < COPIES; i++) {
    player.give(hand.copy())
  }

  // Sonido de prensa
  player.server.runCommandSilent(
    `execute at ${player.name.string} run playsound minecraft:block.book.page_turn master ${player.name.string} ~ ~ ~ 1 0.9`
  )

  player.tell(
    Text.empty()
      .append(Text.gray('La mesa imprimió '))
      .append(Text.gold(COPIES + ' copias'))
      .append(Text.gray(' de ' + title + '.'))
      .append(Text.gray('\n§7Distribúyelas por el buzón.'))
  )
})
