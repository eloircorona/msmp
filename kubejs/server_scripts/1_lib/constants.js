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
    FIRST_JOIN:  'msmp:first_join',
    ROLE:        'msmp:role',
    WALLET:      'msmp:wallet',
    BANK_ACTIVE: 'msmp:bank_active',   // flag de sesión bancaria activa
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
}
