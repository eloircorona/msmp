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
}
