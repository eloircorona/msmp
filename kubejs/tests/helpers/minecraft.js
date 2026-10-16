// Mock factories for KubeJS / Minecraft API primitives.
// Each factory returns a plain JS object that mimics the real API surface.

function makeTextComponent(content) {
  const comp = {
    _content: content !== undefined ? String(content) : '',
    _parts: [],
    append(other) { this._parts.push(other); return this; },
    toString() {
      return this._content + this._parts.map(p => (p ? String(p) : '')).join('');
    },
  };
  return comp;
}

// Proxy so any color method (gold, gray, dark_green, etc.) works without listing them all.
function makeTextApi() {
  return new Proxy(
    { empty: () => makeTextComponent() },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return (s) => makeTextComponent(s);
      },
    }
  );
}

function makeItem() {
  return {
    of: (id, data) => ({ id, data: data || {} }),
  };
}

// items: array of { id, count } for slots 0-35
function makeInventory(items = []) {
  const slots = Array.from({ length: 36 }, (_, i) => {
    const item = items[i];
    if (!item) return { empty: true, id: null, count: 0, shrink: jest.fn() };
    const slot = { empty: false, id: item.id, count: item.count };
    slot.shrink = jest.fn((n) => {
      slot.count = Math.max(0, slot.count - n);
      if (slot.count === 0) slot.empty = true;
    });
    return slot;
  });
  return { getItem: (i) => slots[i], _slots: slots };
}

// opts.gameTime: server overworld game time in ticks
// opts.data: initial persistent data for server
function makeServer(opts = {}) {
  const data = Object.assign({}, opts.data || {});
  return {
    persistentData: {
      getString:  (key) => (data[key] !== undefined ? String(data[key]) : ''),
      putString:  (key, val) => { data[key] = val; },
      getBoolean: (key) => Boolean(data[key]),
      putBoolean: (key, val) => { data[key] = val; },
      getInt:     (key) => (typeof data[key] === 'number' ? data[key] : 0),
      putInt:     (key, val) => { data[key] = val; },
      remove:     (key) => { delete data[key]; },
    },
    overworld: () => ({ getGameTime: () => opts.gameTime || 0 }),
    scheduleInTicks: jest.fn(),
    runCommandSilent: jest.fn(),
    _data: data,
  };
}

// opts.name: player name string
// opts.items: [{ id, count }] for inventory slots
// opts.data: initial persistent data (e.g. { 'msmp:wallet': 100 })
// opts.server: override server (defaults to makeServer())
function makePlayer(opts = {}) {
  const data = Object.assign({}, opts.data || {});
  const server = opts.server || makeServer();
  return {
    persistentData: {
      getBoolean: (key) => data[key] === true,
      putBoolean: (key, val) => { data[key] = val; },
      getInt:     (key) => (typeof data[key] === 'number' ? data[key] : 0),
      putInt:     (key, val) => { data[key] = val; },
      getString:  (key) => (typeof data[key] === 'string' ? data[key] : ''),
      putString:  (key, val) => { data[key] = val; },
      remove:     (key) => { delete data[key]; },
    },
    inventory: makeInventory(opts.items || []),
    name:   { string: opts.name || 'TestPlayer' },
    tell:   jest.fn(),
    give:   jest.fn(),
    server,
    _data: data,
  };
}

module.exports = { makeTextApi, makeItem, makeInventory, makePlayer, makeServer };
