const { makeTextApi, makeItem, makePlayer } = require('./helpers/minecraft');
const { loadScripts } = require('./helpers/loader');

let BankService, EconomyService, BankRepo, MSMP;

beforeAll(() => {
  const ctx = loadScripts({ Text: makeTextApi(), Item: makeItem() });
  BankService   = ctx.BankService;
  EconomyService = ctx.EconomyService;
  BankRepo      = ctx.BankRepo;
  MSMP          = ctx.MSMP;
});

// Helper: player with bank session already marked active
function activePlayer(opts = {}) {
  return makePlayer({
    ...opts,
    data: { [MSMP.KEYS.BANK_ACTIVE]: true, ...(opts.data || {}) },
  });
}

describe('BankService.processInput — cancelar', () => {
  it('clears the bank session and tells the player', () => {
    const player = activePlayer();
    BankService.processInput(player, 'cancelar');
    expect(BankRepo.isActive(player)).toBe(false);
    expect(player.tell).toHaveBeenCalled();
  });

  it('accepts leading/trailing whitespace', () => {
    const player = activePlayer();
    BankService.processInput(player, '  cancelar  ');
    expect(BankRepo.isActive(player)).toBe(false);
  });
});

describe('BankService.processInput — dep', () => {
  it('deposits emeralds from inventory and closes session', () => {
    const player = activePlayer({
      items: [{ id: MSMP.ECONOMY.CURRENCY_ITEM, count: 20 }],
    });
    BankService.processInput(player, 'dep 10');
    expect(EconomyService.getBalance(player)).toBe(10);
    expect(BankRepo.isActive(player)).toBe(false);
    expect(player.tell).toHaveBeenCalled();
  });

  it('deposits all available when player has fewer than requested', () => {
    const player = activePlayer({
      items: [{ id: MSMP.ECONOMY.CURRENCY_ITEM, count: 3 }],
    });
    BankService.processInput(player, 'dep 10');
    expect(EconomyService.getBalance(player)).toBe(3);
  });

  it('tells no-emeralds message when inventory is empty', () => {
    const player = activePlayer();
    BankService.processInput(player, 'dep 10');
    expect(EconomyService.getBalance(player)).toBe(0);
    expect(player.tell).toHaveBeenCalled();
    expect(BankRepo.isActive(player)).toBe(false);
  });

  it('long form "depositar N" is accepted', () => {
    const player = activePlayer({
      items: [{ id: MSMP.ECONOMY.CURRENCY_ITEM, count: 5 }],
    });
    BankService.processInput(player, 'depositar 5');
    expect(EconomyService.getBalance(player)).toBe(5);
  });
});

describe('BankService.processInput — ret', () => {
  it('gives items to player and reduces wallet balance', () => {
    const player = activePlayer({ data: { [MSMP.KEYS.WALLET]: 20, [MSMP.KEYS.BANK_ACTIVE]: true } });
    BankService.processInput(player, 'ret 10');
    expect(EconomyService.getBalance(player)).toBe(10);
    expect(player.give).toHaveBeenCalledTimes(1);
    expect(BankRepo.isActive(player)).toBe(false);
  });

  it('gives only available balance when requesting more than stored', () => {
    const player = activePlayer({ data: { [MSMP.KEYS.WALLET]: 5, [MSMP.KEYS.BANK_ACTIVE]: true } });
    BankService.processInput(player, 'ret 20');
    expect(EconomyService.getBalance(player)).toBe(0);
    const givenItem = player.give.mock.calls[0][0];
    expect(givenItem.id).toBe(MSMP.ECONOMY.CURRENCY_ITEM);
  });

  it('tells insufficient when balance is 0', () => {
    const player = activePlayer();
    BankService.processInput(player, 'ret 5');
    expect(player.give).not.toHaveBeenCalled();
    expect(player.tell).toHaveBeenCalled();
    expect(BankRepo.isActive(player)).toBe(false);
  });

  it('long form "retirar N" is accepted', () => {
    const player = activePlayer({ data: { [MSMP.KEYS.WALLET]: 10, [MSMP.KEYS.BANK_ACTIVE]: true } });
    BankService.processInput(player, 'retirar 10');
    expect(EconomyService.getBalance(player)).toBe(0);
  });
});

describe('BankService.processInput — unknown command', () => {
  it('tells error without closing the session', () => {
    const player = activePlayer();
    BankService.processInput(player, 'hola');
    expect(player.tell).toHaveBeenCalled();
    expect(BankRepo.isActive(player)).toBe(true);
  });

  it('leaves session open on typo so player can retry', () => {
    const player = activePlayer();
    BankService.processInput(player, 'deposit 10');
    expect(BankRepo.isActive(player)).toBe(true);
  });
});
