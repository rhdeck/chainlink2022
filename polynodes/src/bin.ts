#!/usr/bin/env node
import commander from "commander";
import { image, region } from "dots-wrapper/dist/modules";
import fs, { writeFileSync } from "fs";
import {
  createDroplet,
  destroyDroplet,
  getDropletByKey,
  getDroplets,
  sshTo,
} from "./do";
import {
  ChainlinkJobDefinition,
  createBridge,
  createJob,
  createJobToml,
  login,
} from "./chainlink";
import { ChainlinkDOTGraph, Steps } from "./dotgraph";
import { ChainlinkVariable } from "./chainlinkvariable";
import { deployDirectory, yarnInstall } from "./externalAdapters";
import { join } from "path";
import dotenv from "dotenv";
dotenv.config();
commander.arguments("<keyname>");
commander.description("Build test and destroy a droplet");
commander
  .command("createjob <key>")
  .option("--bridge <bridgeName>")
  .action(async (key, command) => {
    //Now make a bridge
    console.log(command);
    const bridge = command.bridge;
    if (!bridge) process.exit();
    const bridgeName = bridge;
    const contractAddress = "0x0000000000000000000000000000000000000000";
    const graph = new ChainlinkDOTGraph()
      .add(Steps.decode_log)
      .add(Steps.decode_cbor)
      .add(
        Steps.bridge(bridgeName, {
          id: new ChainlinkVariable("jobSpec.externalJobId"),
          data: { symbol: new ChainlinkVariable("decode_cbor.symbol") },
        })
      )
      // .add(({ steps, add }) =>
      //   add(Steps.encode_data_uint([...steps[0]].pop() || ""))
      // )
      // .add(Steps.encode_data_uint("fetch"))
      .add(Steps.parse(bridgeName))
      .add(Steps.encode_tx)
      .add(Steps.submit_tx(contractAddress));
    const job: ChainlinkJobDefinition = {
      name: "testjob0012",
      // externalJobID: "35256481-6b0b-4967-a023-f0a00ffc750f",
      contractAddress,
      evmChainID: 137,
      graph,
    };
    const { ssh, close } = await sshTo(key);
    try {
      await login(ssh);
      const bridgeOut = await createBridge(ssh, {
        name: bridgeName,
        url: "http://localhost:8080/testbridge",
      });
      console.log("Made bridge", bridgeOut);
      const output = await createJob(ssh, job);
      console.log("result from createjob", output);
    } catch (e) {
      console.log("error", e);
    }
    close();
    const out = createJobToml(job);
    writeFileSync("testjob.toml", out);
  });
commander.command("deploy <key> <path>").action(async (key, path) => {
  const { ssh, close } = await sshTo(key);
  try {
    // await login(ssh);
    console.log(
      "sending my code along from ",
      path,
      "to",
      join("/", "root", path)
    );
    const targetPath = join("/", "root", path);
    await deployDirectory(ssh, path, targetPath);
    const output = await yarnInstall(ssh, targetPath);
    console.log("result from deploy", output);
  } catch (e) {
    console.log("error", e);
  }
  close();
  console.log("All closed up");
});
commander.command("build <key>").action(async (key) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  const { id, privateKey, ...rest } = await createDroplet(key);
  console.log("Created a new droplet at", id, rest);
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

commander.command("ip <key>").action(async (key) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  const droplet = await getDropletByKey(key);
  if (!droplet) {
    console.error("Cannot find droplet with key", key);
    process.exit(1);
  }
  const {
    networks: { v4 },
  } = droplet;
  console.log(v4.find(({ type }) => type === "public")!.ip_address);
});
commander.command("ssh <key>").action(async (key) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  const droplet = await getDropletByKey(key);
  if (!droplet) {
    console.error("Cannot find droplet with key", key);
    process.exit(1);
  }
  const {
    networks: { v4 },
  } = droplet;
  console.log(
    `ssh root@${
      v4.find(({ type }) => type === "public")!.ip_address
    } -i ${key}_root_private.key`
  );
});
commander.command("forward <key> <port>").action(async (key, port) => {
  if (!key) {
    console.error("Cannot run without defining a name for all this");
    process.exit(1);
  }
  if (!port) {
    port = 6688;
  }
  const droplet = await getDropletByKey(key);
  if (!droplet) {
    console.error("Cannot find droplet with key", key);
    process.exit(1);
  }
  const {
    networks: { v4 },
  } = droplet;
  console.log(
    `ssh root@${
      v4.find(({ type }) => type === "public")!.ip_address
    } -i ${key}_root_private.key -Nf -L ${port}:172.17.0.3:6688`
  );
});

commander.command("list").action(async () => {
  const list = (await getDroplets()).map(({ key }) => key);
  console.log(JSON.stringify(list, null, 2));
});
commander.parse(process.argv);

const key = commander.args[0];
