const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },

  transformIgnorePatterns: [],
};

module.exports = config;
