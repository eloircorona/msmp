// MSMP — Quest domain service
// Misiones diarias: 3 misiones por día de MC, iguales para todos.
// El día se calcula por ticks del overworld (24000 ticks = 1 día MC).

const QuestService = {

  currentDay: (server) => Math.floor(server.overworld().getGameTime() / 24000),

  // IDs de las 3 misiones del día (nivel servidor — iguales para todos).
  serverQuestIds: (server) => {
    const day = QuestService.currentDay(server)
    const raw = ServerRepo.getString(server, MSMP.KEYS.QUEST_DAY_IDS)
    if (raw) {
      const cached = JSON.parse(raw)
      if (cached.day === day) return cached.ids
    }
    // Nuevo día: Fisher-Yates sobre el pool y tomar DAILY_COUNT
    const pool = MSMP.QUESTS.POOL.map(q => q.id)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp
    }
    const ids = pool.slice(0, MSMP.QUESTS.DAILY_COUNT)
    ServerRepo.setString(server, MSMP.KEYS.QUEST_DAY_IDS, JSON.stringify({ day, ids }))
    return ids
  },

  // Progreso del jugador hoy: { day, progress: [n,n,n], claimed: [bool,bool,bool] }
  playerData: (player, server) => {
    const day = QuestService.currentDay(server)
    const raw = player.persistentData.getString(MSMP.KEYS.QUEST_PROGRESS)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.day === day) return data
    }
    return { day, progress: [0, 0, 0], claimed: [false, false, false] }
  },

  savePlayerData: (player, data) => {
    player.persistentData.putString(MSMP.KEYS.QUEST_PROGRESS, JSON.stringify(data))
  },

  // Registra progreso para misiones del tipo+target dado.
  track: (player, server, type, targetId, count) => {
    const c    = count === undefined ? 1 : count
    const ids  = QuestService.serverQuestIds(server)
    const data = QuestService.playerData(player, server)
    let changed = false
    ids.forEach((id, i) => {
      if (data.claimed[i]) return
      const q = MSMP.QUESTS.POOL.find(q => q.id === id)
      if (!q || q.type !== type) return
      if (q.targets.indexOf(targetId) === -1) return
      if (data.progress[i] >= q.amount) return
      data.progress[i] = Math.min(q.amount, data.progress[i] + c)
      changed = true
    })
    if (changed) QuestService.savePlayerData(player, data)
  },

  // Reclama recompensa. n es 1-indexado. Devuelve { ok, reward? } o { ok:false, reason }.
  claim: (player, server, n) => {
    const i   = n - 1
    const ids = QuestService.serverQuestIds(server)
    if (i < 0 || i >= ids.length) return { ok: false, reason: 'invalid' }
    const data = QuestService.playerData(player, server)
    if (data.claimed[i]) return { ok: false, reason: 'already_claimed' }
    const q = MSMP.QUESTS.POOL.find(q => q.id === ids[i])
    if (data.progress[i] < q.amount) return { ok: false, reason: 'incomplete' }
    data.claimed[i] = true
    QuestService.savePlayerData(player, data)
    EconomyService.add(player, q.reward)
    return { ok: true, reward: q.reward }
  },
}
