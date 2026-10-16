const { makeTextApi, makeItem, makePlayer, makeServer } = require('./helpers/minecraft');
const { loadScripts } = require('./helpers/loader');

let QuestService, EconomyService, MSMP;

beforeAll(() => {
  const ctx = loadScripts({ Text: makeTextApi(), Item: makeItem() });
  QuestService   = ctx.QuestService;
  EconomyService = ctx.EconomyService;
  MSMP           = ctx.MSMP;
});

// Helper: pre-cache quest IDs on a server so tests don't depend on Math.random
function serverWithQuests(questIds, gameTime = 0) {
  const day = Math.floor(gameTime / 24000);
  return makeServer({
    gameTime,
    data: {
      [MSMP.KEYS.QUEST_DAY_IDS]: JSON.stringify({ day, ids: questIds }),
    },
  });
}

// Helper: player with quest progress already stored
function playerWithProgress(server, progress, claimed, gameTime = 0) {
  const day = Math.floor(gameTime / 24000);
  return makePlayer({
    data: {
      [MSMP.KEYS.QUEST_PROGRESS]: JSON.stringify({ day, progress, claimed }),
    },
    server,
  });
}

describe('QuestService.currentDay', () => {
  it('returns 0 at tick 0', () => {
    expect(QuestService.currentDay(makeServer({ gameTime: 0 }))).toBe(0);
  });

  it('returns 1 at tick 24000', () => {
    expect(QuestService.currentDay(makeServer({ gameTime: 24000 }))).toBe(1);
  });

  it('returns 2 at tick 48500 (floors mid-day)', () => {
    expect(QuestService.currentDay(makeServer({ gameTime: 48500 }))).toBe(2);
  });
});

describe('QuestService.playerData', () => {
  it('returns fresh zeroed data when nothing is stored', () => {
    const server = serverWithQuests(['mine_stone', 'kill_zombie', 'craft_bread']);
    const player = makePlayer({ server });
    const data = QuestService.playerData(player, server);
    expect(data.progress).toEqual([0, 0, 0]);
    expect(data.claimed).toEqual([false, false, false]);
    expect(data.day).toBe(0);
  });

  it('returns stored data when the stored day matches', () => {
    const server = serverWithQuests(['mine_stone', 'kill_zombie', 'craft_bread']);
    const player = playerWithProgress(server, [5, 10, 2], [false, true, false]);
    const data = QuestService.playerData(player, server);
    expect(data.progress).toEqual([5, 10, 2]);
    expect(data.claimed).toEqual([false, true, false]);
  });

  it('returns fresh data when stored day is different', () => {
    const server = serverWithQuests(['mine_stone', 'kill_zombie', 'craft_bread'], 24000); // day 1
    const player = makePlayer({
      data: {
        [MSMP.KEYS.QUEST_PROGRESS]: JSON.stringify({ day: 0, progress: [64, 10, 4], claimed: [true, true, false] }),
      },
      server,
    });
    const data = QuestService.playerData(player, server);
    expect(data.progress).toEqual([0, 0, 0]);
    expect(data.day).toBe(1);
  });
});

describe('QuestService.track', () => {
  // Use mine_stone: type=mine, targets=[minecraft:stone], amount=64
  // Use kill_zombie: type=kill, targets=[minecraft:zombie], amount=10
  // Use craft_bread: type=craft, targets=[minecraft:bread], amount=8
  const QUEST_IDS = ['mine_stone', 'kill_zombie', 'craft_bread'];

  it('increments progress for a matching quest', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = makePlayer({ server });
    QuestService.track(player, server, 'mine', 'minecraft:stone', 10);
    const data = QuestService.playerData(player, server);
    expect(data.progress[0]).toBe(10);
  });

  it('does not exceed the quest target amount', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = playerWithProgress(server, [60, 0, 0], [false, false, false]);
    QuestService.track(player, server, 'mine', 'minecraft:stone', 20);
    const data = QuestService.playerData(player, server);
    expect(data.progress[0]).toBe(64); // capped at quest amount
  });

  it('does not update progress for an already-claimed quest', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = playerWithProgress(server, [64, 0, 0], [true, false, false]);
    QuestService.track(player, server, 'mine', 'minecraft:stone', 5);
    const data = QuestService.playerData(player, server);
    expect(data.progress[0]).toBe(64); // unchanged
  });

  it('ignores events with the wrong type', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = makePlayer({ server });
    QuestService.track(player, server, 'kill', 'minecraft:stone', 10);
    const data = QuestService.playerData(player, server);
    expect(data.progress[0]).toBe(0);
  });

  it('ignores events with the wrong target', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = makePlayer({ server });
    QuestService.track(player, server, 'mine', 'minecraft:dirt', 10);
    const data = QuestService.playerData(player, server);
    expect(data.progress).toEqual([0, 0, 0]);
  });

  it('updates the correct quest when multiple types are active', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = makePlayer({ server });
    QuestService.track(player, server, 'kill', 'minecraft:zombie', 3);
    const data = QuestService.playerData(player, server);
    expect(data.progress[0]).toBe(0);  // mine_stone untouched
    expect(data.progress[1]).toBe(3);  // kill_zombie updated
    expect(data.progress[2]).toBe(0);  // craft_bread untouched
  });
});

describe('QuestService.claim', () => {
  const QUEST_IDS = ['mine_stone', 'kill_zombie', 'craft_bread'];

  it('grants reward and marks quest as claimed on completion', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = playerWithProgress(server, [64, 10, 8], [false, false, false]);
    const result = QuestService.claim(player, server, 1); // mine_stone, reward=8
    expect(result).toEqual({ ok: true, reward: 8 });
    expect(EconomyService.getBalance(player)).toBe(8);
    const data = QuestService.playerData(player, server);
    expect(data.claimed[0]).toBe(true);
  });

  it('returns already_claimed when quest was already collected', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = playerWithProgress(server, [64, 0, 0], [true, false, false]);
    const result = QuestService.claim(player, server, 1);
    expect(result).toEqual({ ok: false, reason: 'already_claimed' });
  });

  it('returns incomplete when quest is not finished', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = playerWithProgress(server, [10, 0, 0], [false, false, false]);
    const result = QuestService.claim(player, server, 1);
    expect(result).toEqual({ ok: false, reason: 'incomplete' });
  });

  it('returns invalid for out-of-bounds n', () => {
    const server = serverWithQuests(QUEST_IDS);
    const player = makePlayer({ server });
    expect(QuestService.claim(player, server, 0)).toEqual({ ok: false, reason: 'invalid' });
    expect(QuestService.claim(player, server, 4)).toEqual({ ok: false, reason: 'invalid' });
  });
});
