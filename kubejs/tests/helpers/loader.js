// Loads KubeJS server scripts into a controlled JS scope.
//
// KubeJS scripts use `const` at the top level and rely on globally-injected
// APIs (Text, Item, etc.). We load them via `new Function` so that:
//   - `const` declarations are local to the function body (accessible via return)
//   - dependencies are injected as named parameters (no global pollution)
//   - each loadScripts() call produces an independent context

const fs   = require('fs');
const path = require('path');

const SERVER_SCRIPTS = path.resolve(__dirname, '../../server_scripts');

// Ordered list of scripts + what each one exports into the shared context.
const SCRIPTS = [
  { file: '1_lib/constants.js',          exports: ['MSMP'] },
  { file: '1_lib/storage.js',            exports: ['PlayerRepo', 'BankRepo', 'ServerRepo'] },
  { file: '1_lib/inventory.js',          exports: ['Inventory'] },
  { file: '1_lib/text.js',               exports: ['MText'] },
  { file: '2_domain/economy_service.js', exports: ['EconomyService'] },
  { file: '2_domain/bank_service.js',    exports: ['BankService'] },
  { file: '2_domain/role_service.js',    exports: ['RoleService'] },
  { file: '2_domain/player_service.js',  exports: ['PlayerService'] },
  { file: '2_domain/quest_service.js',   exports: ['QuestService'] },
];

// mocks: initial globals to inject (e.g. { Text, Item }).
// Returns the accumulated context with all exported services available.
function loadScripts(mocks) {
  const context = Object.assign({}, mocks);

  for (const { file, exports: exportNames } of SCRIPTS) {
    const code = fs.readFileSync(path.join(SERVER_SCRIPTS, file), 'utf8');
    const paramNames  = Object.keys(context);
    const paramValues = Object.values(context);
    const returnStmt  = `\nreturn { ${exportNames.join(', ')} };`;

    try {
      // new Function body: script code + explicit return of defined names.
      // `const` inside a function body is accessible in the return statement.
      const fn = new Function(...paramNames, code + returnStmt);
      const result = fn(...paramValues);
      Object.assign(context, result);
    } catch (e) {
      throw new Error(`Failed to load ${file}: ${e.message}`);
    }
  }

  return context;
}

module.exports = { loadScripts };
