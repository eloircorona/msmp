const { makeTextApi, makeItem, makePlayer } = require('./helpers/minecraft');
const { loadScripts } = require('./helpers/loader');

let RoleService, MSMP;

beforeAll(() => {
  const ctx = loadScripts({ Text: makeTextApi(), Item: makeItem() });
  RoleService = ctx.RoleService;
  MSMP        = ctx.MSMP;
});

describe('RoleService.isValid', () => {
  it('returns true for all defined role keys', () => {
    for (const key of Object.keys(MSMP.ROLES)) {
      expect(RoleService.isValid(key)).toBe(true);
    }
  });

  it('returns false for unknown keys', () => {
    expect(RoleService.isValid('rey')).toBe(false);
    expect(RoleService.isValid('')).toBe(false);
    expect(RoleService.isValid('__proto__')).toBe(false);
  });
});

describe('RoleService.assign', () => {
  it('sets the role and returns true for a valid key', () => {
    const player = makePlayer();
    const result = RoleService.assign(player, 'alcalde');
    expect(result).toBe(true);
    expect(player._data[MSMP.KEYS.ROLE]).toBe('alcalde');
  });

  it('returns false and does not modify player for an invalid key', () => {
    const player = makePlayer();
    const result = RoleService.assign(player, 'maestro');
    expect(result).toBe(false);
    expect(player._data[MSMP.KEYS.ROLE]).toBeUndefined();
  });
});

describe('RoleService.remove', () => {
  it('clears the role', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.ROLE]: 'policia' } });
    RoleService.remove(player);
    expect(player._data[MSMP.KEYS.ROLE]).toBeUndefined();
  });
});

describe('RoleService.getCurrent', () => {
  it('returns the full role object when a valid role is set', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.ROLE]: 'banquero' } });
    const role = RoleService.getCurrent(player);
    expect(role).not.toBeNull();
    expect(role.key).toBe('banquero');
    expect(role.label).toBe('Banquero');
    expect(typeof role.color).toBe('string');
    expect(typeof role.symbol).toBe('string');
  });

  it('returns null when no role is set', () => {
    const player = makePlayer();
    expect(RoleService.getCurrent(player)).toBeNull();
  });

  it('returns null when stored key is no longer valid', () => {
    const player = makePlayer({ data: { [MSMP.KEYS.ROLE]: 'obsoleto' } });
    expect(RoleService.getCurrent(player)).toBeNull();
  });
});
