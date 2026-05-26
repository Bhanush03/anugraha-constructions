import { defineConfig } from "orval";

export default defineConfig({
  anugraha: {
    input: {
      target: "./openapi.json"
    },
    output: {
      client: "tanstack-query",
      target: "../api-client-react/src/generated.ts",
      schemas: "../api-zod/src/generated.ts"
    }
  }
});
