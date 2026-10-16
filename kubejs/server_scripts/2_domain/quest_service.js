// MSMP — Quest domain service
// Misiones diarias: 3 misiones por día de MC, iguales para todos.
// El día se calcula por ticks del overworld (24000 ticks = 1 día MC).
//
// NOTA (KubeJS 377 / Rhino): se usa `var` (no const/let) porque Rhino trata las
// declaraciones const/let dentro de bloques anidados (if/for) como redeclaraciones.
// Además ServerLevel no expone getGameTime() directo — se usa `.time`.

const QuestService = {

  currentDay: (server) => Math.floor(server.overworld().time / 24000),

  // IDs de las 3 misiones del día (nivel servidor — iguales para todos).
  serverQuestIds: (server) => {
    var day = QuestService.currentDay(server)
    var raw = ServerRepo.getString(server, MSMP.KEYS.QUEST_DAY_IDS)
    if (raw) {
      var cached = JSON.parse(raw)
      if (cached.day === day) return cached.ids
    }
    var pool = MSMP.QUESTS.POOL.map(q => q.id)
    var i, j, tmp
    for (i = pool.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp
    }
    var ids = pool.slice(0, MSMP.QUESTS.DAILY_COUNT)
    ServerRepo.setString(server, MSMP.KEYS.QUEST_DAY_IDS, JSON.stringify({ day: day, ids: ids }))
    return ids
  },

  // Progreso del jugador hoy: { day, progress: [n,n,n], claimed: [bool,bool,bool] }
  playerData: (player, server) => {
    var day = QuestService.currentDay(server)
    var raw = player.persistentData.getString(MSMP.KEYS.QUEST_PROGRESS)
    if (raw) {
      var data = JSON.parse(raw)
      if (data.day === day) return data
    }
    return { day: day, progress: [0, 0, 0], claimed: [false, false, false] }
  },

  savePlayerData: (player, data) => {
    player.persistentData.putString(MSMP.KEYS.QUEST_PROGRESS, JSON.stringify(data))
  },

  // Registra progreso para misiones del tipo+target dado.
  track: (player, server, type, targetId, count) => {
    var c    = count === undefined ? 1 : count
    var ids  = QuestService.serverQuestIds(server)
    var data = QuestService.playerData(player, server)
    var changed = false
    ids.forEach((id, i) => {
      if (data.claimed[i]) return
      var q = MSMP.QUESTS.POOL.find(qq => qq.id === id)
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
    var i   = n - 1
    var ids = QuestService.serverQuestIds(server)
    if (i < 0 || i >= ids.length) return { ok: false, reason: 'invalid' }
    var data = QuestService.playerData(player, server)
    if (data.claimed[i]) return { ok: false, reason: 'already_claimed' }
    var q = MSMP.QUESTS.POOL.find(qq => qq.id === ids[i])
    if (data.progress[i] < q.amount) return { ok: false, reason: 'incomplete' }
    data.claimed[i] = true
    QuestService.savePlayerData(player, data)
    EconomyService.add(player, q.reward)
    return { ok: true, reward: q.reward }
  },
}
