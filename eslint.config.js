import rocketseat from "@rocketseat/eslint-config/node.js";

export default [
  {
    ...rocketseat,
    ignores: ["node_modules", "dist", "build"],
  },
];
