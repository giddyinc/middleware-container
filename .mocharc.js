
'use strict';

module.exports = {
  diff: true,
  require: ['source-map-support/register', 'ts-node/register'],
  extension: ['ts'],
  package: './package.json',
  reporter: 'spec',
  spec: "test/**",
  slow: 75,
  timeout: 5000,
  ui: 'bdd',
  'watch-extensions': ['ts'],
  recursive: true,
  exit: true,
  checkLeaks: true,
  retries: 3,
};
