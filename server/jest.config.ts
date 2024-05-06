/** @type {import('ts-jest').JestConfigWithTsJest} */
import type { Config } from "jest";

module.exports = {
    preset: "ts-jest/presets/default-esm",
    moduleNameMapper: {
      "(.+)\\.js": "$1",
    },
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
};


// export default config;
