module.exports = {
  roots: [
    '<rootDir>/test/unit',
  ],
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': '@swc-node/jest',
  },
}
