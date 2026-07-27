// MSMP — Inventory utilities
// Funciones para contar y remover items del inventario del jugador.
// Cubre slots 0-35 (hotbar + inventario principal). No toca armadura ni offhand.

const Inventory = {
  // Cuenta cuántos items del tipo dado tiene el jugador.
  count: (player, itemId) => {
    let total = 0
    const inv = player.inventory
    for (let i = 0; i < 36; i++) {
      const slot = inv.getItem(i)
      if (slot && !slot.empty && slot.id === itemId) total += slot.count
    }
    return total
  },

  // Remueve hasta `amount` items del tipo dado. Devuelve cuántos removió realmente.
  remove: (player, itemId, amount) => {
    let remaining = amount
    const inv = player.inventory
    for (let i = 0; i < 36 && remaining > 0; i++) {
      const slot = inv.getItem(i)
      if (slot && !slot.empty && slot.id === itemId) {
        const take = Math.min(slot.count, remaining)
        slot.shrink(take)
        remaining -= take
      }
    }
    return amount - remaining
  },

  // True si el jugador tiene al menos `amount` items del tipo dado.
  has: (player, itemId, amount) => Inventory.count(player, itemId) >= amount,
}
