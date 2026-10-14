const { makeTextApi, makeItem, makePlayer } = require('./helpers/minecraft');
const { loadScripts } = require('./helpers/loader');

let EconomyService, MSMP;

beforeAll(() => {
  const ctx = loadScripts({ Text: makeTextApi(), Item: makeItem() });
  EconomyService = ctx.EconomyService;
  MSMP = ctx.MSMP;
});

describe('EconomyService.getBalance', () => {
  it('returns 0 when no wallet stored', () => {
    const player = makePlayer();
    expect(EconomyService.getBalance(player)).toBe(0);
  });

  it('returns stored balance', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: 42 } });
    expect(EconomyService.getBalance(player)).toBe(42);
  });

  it('returns 0 when stored value is negative', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: -5 } });
    expect(EconomyService.getBalance(player)).toBe(0);
  });
});

describe('EconomyService.add', () => {
  it('increases balance by amount', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: 10 } });
    EconomyService.add(player, 5);
    expect(EconomyService.getBalance(player)).toBe(15);
  });

  it('floors fractional amounts', () => {
    const player = makePlayer();
    EconomyService.add(player, 3.9);
    expect(EconomyService.getBalance(player)).toBe(3);
  });

  it('ignores negative amounts', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: 10 } });
    EconomyService.add(player, -5);
    expect(EconomyService.getBalance(player)).toBe(10);
  });
});

describe('EconomyService.subtract', () => {
  it('reduces balance and returns the deducted amount', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: 20 } });
    const deducted = EconomyService.subtract(player, 8);
    expect(deducted).toBe(8);
    expect(EconomyService.getBalance(player)).toBe(12);
  });

  it('caps deduction at current balance and returns actual amount', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: 5 } });
    const deducted = EconomyService.subtract(player, 10);
    expect(deducted).toBe(5);
    expect(EconomyService.getBalance(player)).toBe(0);
  });

  it('returns 0 when balance is 0', () => {
    const player = makePlayer();
    expect(EconomyService.subtract(player, 10)).toBe(0);
  });

  it('floors fractional input', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.WALLET]: 10 } });
    const deducted = EconomyService.subtract(player, 4.9);
    expect(deducted).toBe(4);
    expect(EconomyService.getBalance(player)).toBe(6);
  });
});

describe('EconomyService.transfer', () => {
  it('transfers amount between players', () => {
    const from = makePlayer({ data: { [MSMP.KEYS.WALLET]: 50 } });
    const to   = makePlayer({ data: { [MSMP.KEYS.WALLET]: 10 } });
    const result = EconomyService.transfer(from, to, 20);
    expect(result).toEqual({ ok: true });
    expect(EconomyService.getBalance(from)).toBe(30);
    expect(EconomyService.getBalance(to)).toBe(30);
  });

  it('returns insufficient when from has less than requested', () => {
    const from = makePlayer({ data: { [MSMP.KEYS.WALLET]: 5 } });
    const to   = makePlayer();
    const result = EconomyService.transfer(from, to, 10);
    expect(result).toEqual({ ok: false, reason: 'insufficient' });
  });

  it('returns zero for zero amount', () => {
    const from = makePlayer({ data: { [MSMP.KEYS.WALLET]: 50 } });
    const to   = makePlayer();
    const result = EconomyService.transfer(from, to, 0);
    expect(result).toEqual({ ok: false, reason: 'zero' });
  });

  it('does not modify balances on failure', () => {
    const from = makePlayer({ data: { [MSMP.KEYS.WALLET]: 5 } });
    const to   = makePlayer({ data: { [MSMP.KEYS.WALLET]: 10 } });
    EconomyService.transfer(from, to, 100);
    expect(EconomyService.getBalance(from)).toBe(5);
    expect(EconomyService.getBalance(to)).toBe(10);
  });
});
