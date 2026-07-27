// MSMP — Repository layer
// Toda lectura/escritura de NBT vive aquí.
// El dominio llama a estas funciones; nunca toca persistentData directamente.

const PlayerRepo = {
  hasFirstJoined: (player) => player.persistentData.getBoolean(MSMP.KEYS.FIRST_JOIN),
  markFirstJoined: (player) => { player.persistentData.putBoolean(MSMP.KEYS.FIRST_JOIN, true) },

  getRole:   (player) => player.persistentData.getString(MSMP.KEYS.ROLE) || null,
  setRole:   (player, key) => { player.persistentData.putString(MSMP.KEYS.ROLE, key) },
  clearRole: (player) => { player.persistentData.remove(MSMP.KEYS.ROLE) },
}

const BankRepo = {
  isActive:    (player) => player.persistentData.getBoolean(MSMP.KEYS.BANK_ACTIVE),
  setActive:   (player) => { player.persistentData.putBoolean(MSMP.KEYS.BANK_ACTIVE, true) },
  clearActive: (player) => { player.persistentData.remove(MSMP.KEYS.BANK_ACTIVE) },
}

const ServerRepo = {
  getString:  (server, key) => server.persistentData.getString(key) || null,
  setString:  (server, key, val) => { server.persistentData.putString(key, val) },
  getBoolean: (server, key) => server.persistentData.getBoolean(key),
  setBoolean: (server, key, val) => { server.persistentData.putBoolean(key, val) },
}
