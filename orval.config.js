const path = require("path");

module.exports = {
  meroedu: {
    input: {
      target: path.resolve(__dirname, "/Users/dinesh.katwal/claude_code/meroedu/backend/docs/swagger.json"),
    },
    output: {
      target: "src/app/api/orval",
      client: "react-query",
      mode: "split",
      override: {
        mutator: {
          path: "src/app/api/orval/http.ts",
          name: "customFetcher",
        },
      },
    },
  },
};
