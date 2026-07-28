// MSMP — Text helpers
// Toda lógica de formato vive aquí. El resto del código solo llama MText.*

const MText = {
  // "[MSMP] mensaje" en gris
  system: (msg) =>
    Text.empty()
      .append(Text.gray('[MSMP] '))
      .append(Text.white(msg)),

  // "[⚑ Alcalde]" en el color del puesto
  roleBadge: (roleKey) => {
    const r = MSMP.ROLES[roleKey]
    if (!r) return Text.empty()
    return Text[r.color](`[${r.symbol} ${r.label}]`)
  },

  // "[⚑ Alcalde] Nombre: mensaje"
  chatLine: (roleKey, playerName, message) => {
    const r = MSMP.ROLES[roleKey]
    if (!r) return Text.white(`${playerName}: ${message}`)
    return Text.empty()
      .append(Text[r.color](`[${r.symbol} ${r.label}]`))
      .append(Text.white(` ${playerName}: `))
      .append(Text.white(message))
  },

  // "━━ MSMP ━━ mensaje" en dorado
  announce: (msg) =>
    Text.empty()
      .append(Text.gold('━━ MSMP ━━ '))
      .append(Text.white(msg)),

  // Lista de todos los puestos con descripción
  roleList: () => {
    const header = Text.empty()
      .append(Text.gold('Puestos del pueblo:\n'))
    const lines = Object.entries(MSMP.ROLES).reduce((acc, [key, r]) => {
      return acc
        .append(Text[r.color](`  ${r.symbol} ${r.label}: `))
        .append(Text.gray(r.desc + '\n'))
    }, header)
    return lines
  },

  // Tablero de misiones del día. Recibe los quest defs y el playerData.
  questBoard: (questDefs, data) => {
    const out = Text.empty()
      .append(Text.gold(`━━ Misiones (día ${data.day}) ━━\n`))
    questDefs.forEach((q, i) => {
      const prog    = data.progress[i]
      const claimed = data.claimed[i]
      const done    = prog >= q.amount
      const statusText = claimed  ? Text.darkGray('[★]')
                       : done     ? Text.green('[✓]')
                       : prog > 0 ? Text.yellow('[▶]')
                       :            Text.gray('[ ]')
      out
        .append(Text.white(` ${i + 1}. `))
        .append(statusText)
        .append(Text.white(' ' + q.label))
        .append(Text.gray(`  ${prog}/${q.amount}  `))
        .append(Text.gold(q.reward + ' '))
        .append(Text.green(MSMP.ECONOMY.SYMBOL))
      if (done && !claimed)
        out.append(Text.aqua('  ← reclamar ' + (i + 1)))
      out.append(Text.white('\n'))
    })
    return out
  },
}
