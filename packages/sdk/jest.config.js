module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: [
    "<rootDir>/jest.setup.js",
  ],
  roots: [
    "<rootDir>/src",
  ],
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts",
  ],
  moduleFileExtensions: [
    "ts",
    "js",
  ],
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.node.json",
      },
    ],
  },
};