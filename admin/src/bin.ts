#!/usr/bin/env node
import commander, { command } from "commander";
import { image, region } from "dots-wrapper/dist/modules";
import fs, { writeFileSync } from "fs";
import {
  createDroplet,
  // createUser,
  // deployCode,
  destroyDroplet,
  getDropletByKey,
  getDroplets,
  // initializeDroplet,
  // sleep,
} from ".";
import { createJobToml } from "./chainlink";
import { ChainlinkDOTGraph, Steps } from "./dotgraph";
commander.arguments("<keyname>");
commander.description("Build test and destroy a droplet");
commander.command("test").action(async (key) => {
  const contractAddress = "0x0000000000000000000000000000000000000000";
  const graph = new ChainlinkDOTGraph()
    .add(Steps.decode_log)
    .add(Steps.decode_cbor)
    .add(Steps.fetch)
    // .add(({ steps, add }) =>
    //   add(Steps.encode_data_uint([...steps[0]].pop() || ""))
    // )
    // .add(Steps.encode_data_uint("fetch"))
    .add(Steps.encode_tx)
    .add(Steps.submit_tx(contractAddress));
  const out = createJobToml({
    name: "testjob2",
    contractAddress,
    evmChainId: 42,
    graph,
  });
  console.log("---BEGIN-----------------------------");
  console.log(out);
  console.log("---END-----------------------------");
  writeFileSync("testjob.toml", out);
});
commander.command("build <key>").action(async (key) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  const { id, privateKey, ...rest } = await createDroplet(key);
  console.log("Created a new droplet at", id, rest);
  console.log("Root private key", privateKey);
  fs.writeFileSync(`${key}_root_private.key`, privateKey);
  fs.chmodSync(`${key}_root_private.key`, 0o600);
});
commander.command("destroy <key>").action(async (key) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  const droplet = await getDropletByKey(key);
  if (!droplet) {
    console.error("Cannot find droplet with key", key);
    process.exit(1);
  }
  await destroyDroplet(droplet.id);
  console.log("Destroyed droplet", droplet.id);
});
commander.command("info <key>").action(async (key) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  const droplet = await getDropletByKey(key);
  if (!droplet) {
    console.error("Cannot find droplet with key", key);
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      {
        ...droplet,
        image: (droplet.image as image.IImage).slug,
        size: droplet.size.slug,
        region: (droplet.region as region.IRegion).slug,
      },
      null,
      2
    )
  );
});
commander.command("list").action(async () => {
  const list = (await getDroplets()).map(({ name }) => name);
  console.log(JSON.stringify(list, null, 2));
});
commander.parse(process.argv);

const key = commander.args[0];
