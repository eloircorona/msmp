// MSMP — Role domain service
// Lógica de puestos: validación, asignación y formateo. Sin event registration.

const RoleService = {
  isValid: (roleKey) => Object.prototype.hasOwnProperty.call(MSMP.ROLES, roleKey),

  // Asigna un puesto al jugador. Devuelve false si roleKey no existe.
  assign: (player, roleKey) => {
    if (!RoleService.isValid(roleKey)) return false
    PlayerRepo.setRole(player, roleKey)
    return true
  },

  remove: (player) => {
    PlayerRepo.clearRole(player)
  },

  // Devuelve { key, label, color, symbol, desc } o null si no tiene puesto.
  getCurrent: (player) => {
    const key = PlayerRepo.getRole(player)
    if (!key || !RoleService.isValid(key)) return null
    return { key, ...MSMP.ROLES[key] }
  },

  // Tarjeta de jugador para /msmp quien
  formatCard: (player) => {
    const role = RoleService.getCurrent(player)
    const name = player.name.string
    if (!role) {
      return Text.empty()
        .append(Text.white(`${name}\n`))
        .append(Text.gray('Sin puesto asignado.'))
    }
    return Text.empty()
      .append(Text.white(`${name}\n`))
      .append(MText.roleBadge(role.key))
      .append(Text.gray(`  ${role.desc}`))
  },
}
