#!/usr/bin/env node
const { writeFileSync } = require("fs");
const package = require("./package.json");
const newKey = process.argv[2];
if (!newKey) throw new Error("No API key provided");
package.serverless.internalKey = newKey;
writeFileSync("package.json", JSON.stringify(package, null, 2));
