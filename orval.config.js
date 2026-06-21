const path = require("path");

module.exports = {
  meroedu: {
    input: {
      target: path.resolve(__dirname, "../backend/docs/swagger.yaml"),
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
