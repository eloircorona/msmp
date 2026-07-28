// MSMP — Configuration
// All tunable values live here. Roles, storage keys, and permissions.
// Load order: this file must load before storage.js and text.js (alphabetical within 1_lib/).

const MSMP = {
  // Puestos disponibles. symbol + color + desc son puramente visuales — no dan ventaja.
  ROLES: {
    alcalde:  { label: 'Alcalde',  color: 'gold',   symbol: '⚑', desc: 'Coordina las decisiones del pueblo.'        },
    policia:  { label: 'Policía',  color: 'blue',   symbol: '⚔', desc: 'Mantiene el orden entre vecinos.'           },
    energia:  { label: 'Energía',  color: 'yellow', symbol: '⚡', desc: 'Administra las fuentes de energía.'         },
    obras:    { label: 'Obras',    color: 'gray',   symbol: '⚙', desc: 'Construye infraestructura pública.'         },
    chef:       { label: 'Chef',       color: 'green',      symbol: '✿', desc: 'Abastece al pueblo con comida y recetas.'    },
    criminal:   { label: 'Criminal',   color: 'red',        symbol: '☠', desc: 'Vive al margen de las normas del pueblo.'   },
    periodista: { label: 'Periodista', color: 'aqua',       symbol: '✒', desc: 'Cubre eventos y publica noticias del pueblo.' },
    banquero:   { label: 'Banquero',   color: 'dark_green', symbol: '◈', desc: 'Gestiona el banco y los fondos comunes.'      },
  },

  // Claves de almacenamiento NBT. Prefijo msmp: para evitar colisiones con otros mods.
  KEYS: {
    FIRST_JOIN:    'msmp:first_join',
    ROLE:          'msmp:role',
    WALLET:        'msmp:wallet',
    BANK_ACTIVE:   'msmp:bank_active',   // flag de sesión bancaria activa
    QUEST_DAY_IDS: 'msmp:quest_day_ids',
    QUEST_PROGRESS: 'msmp:quest_progress',
  },

  // Economía
  ECONOMY: {
    CURRENCY_ITEM: 'minecraft:emerald',
    SYMBOL:        '◆',
  },

  // Mesa de redacción
  PRESS: {
    COPIES:        5,    // copias producidas por impresión
    PAPER_COST:    5,    // papel requerido por tirada
  },

  // Nivel de permiso mínimo para comandos de admin (Minecraft op level).
  PERM: {
    ADMIN: 2,
  },

  QUESTS: {
    DAILY_COUNT: 3,
    POOL: [
      { id: 'mine_stone',    type: 'mine',  targets: ['minecraft:stone'],                                                                                                                                                                       amount: 64, reward: 8,  label: 'Minar 64 piedra'              },
      { id: 'mine_iron',     type: 'mine',  targets: ['minecraft:iron_ore', 'minecraft:deepslate_iron_ore'],                                                                                                                                     amount: 16, reward: 20, label: 'Minar 16 mineral de hierro'   },
      { id: 'mine_coal',     type: 'mine',  targets: ['minecraft:coal_ore', 'minecraft:deepslate_coal_ore'],                                                                                                                                     amount: 32, reward: 12, label: 'Minar 32 mineral de carbón'   },
      { id: 'mine_copper',   type: 'mine',  targets: ['minecraft:copper_ore', 'minecraft:deepslate_copper_ore'],                                                                                                                                 amount: 24, reward: 15, label: 'Minar 24 mineral de cobre'    },
      { id: 'mine_gold',     type: 'mine',  targets: ['minecraft:gold_ore', 'minecraft:deepslate_gold_ore'],                                                                                                                                     amount: 8,  reward: 25, label: 'Minar 8 mineral de oro'       },
      { id: 'mine_log',      type: 'mine',  targets: ['minecraft:oak_log','minecraft:spruce_log','minecraft:birch_log','minecraft:jungle_log','minecraft:acacia_log','minecraft:dark_oak_log','minecraft:mangrove_log','minecraft:cherry_log','minecraft:bamboo_block'], amount: 32, reward: 10, label: 'Talar 32 troncos' },
      { id: 'mine_gravel',   type: 'mine',  targets: ['minecraft:gravel'],                                                                                                                                                                       amount: 64, reward: 6,  label: 'Excavar 64 grava'             },
      { id: 'kill_zombie',   type: 'kill',  targets: ['minecraft:zombie'],                                                                                                                                                                       amount: 10, reward: 15, label: 'Matar 10 zombis'              },
      { id: 'kill_skeleton', type: 'kill',  targets: ['minecraft:skeleton'],                                                                                                                                                                     amount: 10, reward: 15, label: 'Matar 10 esqueletos'          },
      { id: 'kill_creeper',  type: 'kill',  targets: ['minecraft:creeper'],                                                                                                                                                                      amount: 5,  reward: 20, label: 'Matar 5 creepers'             },
      { id: 'kill_spider',   type: 'kill',  targets: ['minecraft:spider'],                                                                                                                                                                       amount: 10, reward: 12, label: 'Matar 10 arañas'              },
      { id: 'kill_enderman', type: 'kill',  targets: ['minecraft:enderman'],                                                                                                                                                                     amount: 5,  reward: 25, label: 'Matar 5 endermen'             },
      { id: 'craft_bread',   type: 'craft', targets: ['minecraft:bread'],                                                                                                                                                                        amount: 8,  reward: 10, label: 'Fabricar 8 pan'               },
      { id: 'craft_chest',   type: 'craft', targets: ['minecraft:chest'],                                                                                                                                                                        amount: 4,  reward: 12, label: 'Fabricar 4 cofres'            },
      { id: 'craft_furnace', type: 'craft', targets: ['minecraft:furnace'],                                                                                                                                                                      amount: 2,  reward: 15, label: 'Fabricar 2 hornos'            },
      { id: 'craft_book',    type: 'craft', targets: ['minecraft:book'],                                                                                                                                                                         amount: 4,  reward: 12, label: 'Fabricar 4 libros'            },
    ],
  },
}
