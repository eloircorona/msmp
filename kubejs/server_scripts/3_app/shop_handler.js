// Application — Tienda del Pueblo (shop nativo de KubeUI, moneda: corcholatas)
// Se abre desde el botón "Tienda del pueblo" en la pantalla del banco
// (client_scripts/bank_screen.js → KubeUI.shop('msmp:tienda')).
// Precios fluctuantes y stock gestionados por KubeUI; compra/venta server-authoritative.

KubeUIActions.defineShop('msmp:tienda', 'Tienda del Pueblo', [
  // comida — stock infinito, precio fijo
  { id: 'pan',       item: 'minecraft:bread',        count: 4, currency: 'corcholatas', price: 5,  sellable: true, sellRate: 0.4, stock: -1 },
  { id: 'manzana',   item: 'minecraft:apple',        count: 4, currency: 'corcholatas', price: 6,  sellable: true, sellRate: 0.4, stock: -1 },
  // materiales — stock limitado, precio fluctuante (oferta/demanda)
  { id: 'hierro',    item: 'minecraft:iron_ingot',   count: 1, currency: 'corcholatas', price: 12, sellable: true, sellRate: 0.5, stock: 64, minPrice: 8,  maxPrice: 20,  fluctuationIntervalTicks: 600 },
  { id: 'carbon',    item: 'minecraft:coal',         count: 8, currency: 'corcholatas', price: 10, sellable: true, sellRate: 0.5, stock: 64, minPrice: 6,  maxPrice: 16,  fluctuationIntervalTicks: 600 },
  { id: 'oro',       item: 'minecraft:gold_ingot',   count: 1, currency: 'corcholatas', price: 20, sellable: true, sellRate: 0.5, stock: 32, minPrice: 14, maxPrice: 32,  fluctuationIntervalTicks: 1200 },
  { id: 'diamante',  item: 'minecraft:diamond',      count: 1, currency: 'corcholatas', price: 80, sellable: true, sellRate: 0.5, stock: 16, minPrice: 60, maxPrice: 120, fluctuationIntervalTicks: 1200 },
])
