import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { module: "CommonJS" } }],
  },
  // next/jest wraps this config, so we declare it here; the wrapper adds
  // Next.js-specific transforms on top.
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: ["app/api/**/*.ts", "lib/**/*.ts"],
};

export default createJestConfig(config);
