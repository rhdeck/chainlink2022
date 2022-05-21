const { readFileSync } = require("fs");
const envs = readFileSync(".env", "utf8")
  .split("\n")
  .map((line) => line.split("="))
  .reduce((o, [key, value]) => ({ ...o, [key]: value }), {});
const keys = Object.keys(envs);
console.log(JSON.stringify(keys));
